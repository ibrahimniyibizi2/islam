import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Upload, X, Eye, FileText, Image as ImageIcon, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'

// Types
interface SignedUrlEntry {
  signedUrl?: string
  expiresAt?: number
  status: 'valid' | 'expired' | 'loading'
}

interface DocumentState {
  file: File | null
  localPreview: string | null
  remotePath: string | null
  signedUrl: string | null
  status: 'idle' | 'uploading' | 'uploaded' | 'error' | 'expired'
  error: string | null
  uploadProgress: number
}

interface ProFileUploadFieldProps {
  label: string
  field: string
  bucketName?: string
  acceptedTypes?: string[]
  maxSizeMB?: number
  required?: boolean
  onChange?: (field: string, path: string | null) => void
  value?: string | null
  placeholder?: string
  className?: string
}

const DEFAULT_BUCKET = 'nikah-documents'
const DEFAULT_ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
const DEFAULT_MAX_SIZE_MB = 10

const ProFileUploadField: React.FC<ProFileUploadFieldProps> = ({
  label,
  field,
  bucketName = DEFAULT_BUCKET,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  maxSizeMB = DEFAULT_MAX_SIZE_MB,
  required = false,
  onChange,
  value,
  placeholder = 'Click to upload or drag & drop',
  className = '',
}) => {
  const [documentState, setDocumentState] = useState<DocumentState>({
    file: null,
    localPreview: null,
    remotePath: null,
    signedUrl: null,
    status: value ? 'uploaded' : 'idle',
    error: null,
    uploadProgress: 0,
  })

  const [signedUrls, setSignedUrls] = useState<Record<string, SignedUrlEntry>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  // Initialize from value prop
  useEffect(() => {
    if (value && !documentState.remotePath) {
      setDocumentState(prev => ({
        ...prev,
        remotePath: value,
        status: 'uploaded',
      }))
    }
  }, [value, documentState.remotePath])

  // Generate signed URL for a file path
  const getSignedUrl = useCallback(async (filePath: string): Promise<string | null> => {
    const cacheKey = filePath
    try {
      // Check cache first
      if (signedUrls[cacheKey] && signedUrls[cacheKey].status === 'valid' && Date.now() < signedUrls[cacheKey].expiresAt) {
        return signedUrls[cacheKey].signedUrl
      }

      // Generate new signed URL using relative path only
      const { data, error } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(filePath, 3600) // 1 hour

      if (error) {
        // Don't log to console - component will handle error display
        setSignedUrls(prev => ({ ...prev, [cacheKey]: { status: 'expired' } }))
        return null
      }

      // Cache the signed URL (55 minutes to be safe)
      const expiresAt = Date.now() + (55 * 60 * 1000)
      setSignedUrls(prev => ({
        ...prev,
        [cacheKey]: {
          signedUrl: data.signedUrl,
          status: 'valid',
          expiresAt
        }
      }))

      return data.signedUrl
    } catch (error) {
      // Don't log to console - component will handle error display
      setSignedUrls(prev => ({ ...prev, [cacheKey]: { status: 'expired' } }))
      return null
    }
  }, [bucketName, signedUrls])

  // Update signed URL when remote path changes - FIXED: no infinite loop and prevents repeated error attempts
  useEffect(() => {
    if (documentState.remotePath && documentState.status === 'uploaded') {
      const path = documentState.remotePath
      // Only generate signed URL if we don't have a cached entry for this path OR if it's valid but expired
      // NEVER attempt again if it was marked as expired (failed)
      if (!signedUrls[path] || (signedUrls[path].status === 'valid' && Date.now() > signedUrls[path].expiresAt)) {
        getSignedUrl(path).then(url => {
          if (url) {
            setDocumentState(prev => ({ ...prev, signedUrl: url }))
          } else {
            // Mark as expired to prevent future attempts
            setSignedUrls(prev => ({ ...prev, [path]: { status: 'expired' } }))
            // If signed URL generation failed (file not found), set error status
            setDocumentState(prev => ({
              ...prev,
              status: 'error',
              error: 'File not found in storage. Please re-upload.',
              signedUrl: null
            }))
          }
        })
      } else if (signedUrls[path]?.status === 'expired') {
        // If already marked as expired, set error state without attempting
        setDocumentState(prev => ({
          ...prev,
          status: 'error',
          error: 'File not found in storage. Please re-upload.',
          signedUrl: null
        }))
      }
    }
  }, [documentState.remotePath, documentState.status]) // getSignedUrl removed from deps to prevent loop

  // Validate file
  const validateFile = useCallback((file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `File type not supported. Please upload: ${acceptedTypes.join(', ')}`
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File too large. Maximum size: ${maxSizeMB}MB`
    }

    return null
  }, [acceptedTypes, maxSizeMB])

  // Handle file selection
  const handleFileSelect = useCallback(async (file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      toast({
        title: 'Invalid File',
        description: validationError,
        variant: 'destructive',
      })
      return
    }

    // Create immediate local preview
    const localPreview = URL.createObjectURL(file)

    setDocumentState({
      file,
      localPreview,
      remotePath: null,
      signedUrl: null,
      status: 'idle',
      error: null,
      uploadProgress: 0,
    })

    // Auto-upload after validation
    await uploadFile(file)
  }, [validateFile])

  // Upload file to Supabase
  const uploadFile = useCallback(async (file: File) => {
    setDocumentState(prev => ({ ...prev, status: 'uploading', uploadProgress: 0 }))

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = fileName

      // Check if bucket exists first
      const { data: buckets } = await supabase.storage.listBuckets()
      const bucketExists = buckets?.some(b => b.name === bucketName)
      
      if (!bucketExists) {
        throw new Error(`Storage bucket "${bucketName}" does not exist. Please create it in Supabase dashboard.`)
      }

      // Upload to Supabase
      // Simulate progress since onUploadProgress is not supported in current version
      const progressInterval = setInterval(() => {
        setDocumentState(prev => {
          if (prev.uploadProgress < 90) {
            return { ...prev, uploadProgress: prev.uploadProgress + 10 }
          }
          return prev
        })
      }, 100)

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      clearInterval(progressInterval)

      if (uploadError) throw uploadError

      // Verify upload was successful
      const { data: checkFile } = await supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath)

      setDocumentState(prev => ({
        ...prev,
        remotePath: filePath,
        status: 'uploaded',
        uploadProgress: 100,
      }))

      onChange?.(field, filePath)

      toast({
        title: 'Upload Successful',
        description: `${file.name} uploaded successfully.`,
      })
    } catch (error) {
      // Don't log to console - component will handle error display
      setDocumentState(prev => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : 'Upload failed',
      }))

      toast({
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'Failed to upload file',
        variant: 'destructive',
      })
    }
  }, [bucketName, field, onChange])

  // Handle file input change
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileSelect(file)
    // Reset input
    e.target.value = ''
  }, [handleFileSelect])

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }, [handleFileSelect])

  // Remove file
  const handleRemove = useCallback(() => {
    // Revoke object URL to prevent memory leaks
    if (documentState.localPreview) {
      URL.revokeObjectURL(documentState.localPreview)
    }

    setDocumentState({
      file: null,
      localPreview: null,
      remotePath: null,
      signedUrl: null,
      status: 'idle',
      error: null,
      uploadProgress: 0,
    })

    onChange?.(field, null)
  }, [documentState.localPreview, field, onChange])

  // Replace file
  const handleReplace = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  // Get display URL (local preview or signed URL)
  const getDisplayUrl = useCallback(() => {
    return documentState.localPreview || documentState.signedUrl
  }, [documentState.localPreview, documentState.signedUrl])

  // Get status badge
  const getStatusBadge = useCallback(() => {
    switch (documentState.status) {
      case 'uploading':
        return (
          <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            Uploading ({documentState.uploadProgress}%)
          </span>
        )
      case 'uploaded':
        return (
          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Uploaded
          </span>
        )
      case 'error':
        return (
          <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
            <AlertCircle className="mr-1 h-3 w-3" />
            Error
          </span>
        )
      default:
        return null
    }
  }, [documentState.status, documentState.uploadProgress])

  // Check if file is image
  const isImage = useCallback((url: string) => {
    return url.includes('.jpg') || url.includes('.jpeg') || url.includes('.png') ||
           url.startsWith('data:image/') || url.startsWith('blob:')
  }, [])

  const displayUrl = getDisplayUrl()
  const isImg = displayUrl ? isImage(displayUrl) : false

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-sm font-medium">
        {label}{required && <span className="text-destructive ml-0.5">*</span>}
      </label>

      {/* Upload Area */}
      {!displayUrl ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors
            ${isDragOver
              ? 'border-primary bg-primary/5'
              : 'border-gray-300 hover:border-primary hover:bg-gray-50'
            }
          `}
        >
          <Upload className="h-8 w-8 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600 text-center">{placeholder}</p>
          <p className="text-xs text-gray-400 mt-1">
            {acceptedTypes.join(', ')} • Max {maxSizeMB}MB
          </p>
        </div>
      ) : (
        /* Preview Area */
        <div className="relative border rounded-lg p-4 bg-gray-50">
          <div className="flex items-start gap-4">
            {/* File Icon / Preview */}
            <div className="flex-shrink-0">
              {isImg ? (
                <img
                  src={displayUrl}
                  alt="Preview"
                  className="w-16 h-16 object-cover rounded-lg border"
                />
              ) : (
                <div className="w-16 h-16 flex items-center justify-center bg-white rounded-lg border">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
              )}
            </div>

            {/* File Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {documentState.file?.name || 'Uploaded file'}
                </p>
                {getStatusBadge()}
              </div>

              {documentState.error && (
                <p className="text-xs text-red-600 mb-2">{documentState.error}</p>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                {displayUrl && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(displayUrl, '_blank')}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                )}

                <Button size="sm" variant="outline" onClick={handleReplace}>
                  Replace
                </Button>

                <Button size="sm" variant="ghost" onClick={handleRemove}>
                  <X className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  )
}

export default ProFileUploadField
