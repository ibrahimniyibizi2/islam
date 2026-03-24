-- Criar bucket para documentos nikah
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'nikah_documents',
  'nikah_documents',
  false, -- privado para documentos sensíveis
  10485760, -- 10MB
  ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

-- Política para permitir uploads de usuários autenticados
CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'nikah_documents');

-- Política para permitir que usuários vejam seus próprios arquivos
CREATE POLICY "Allow authenticated reads" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'nikah_documents');

-- Política para permitir updates (remover arquivos)
CREATE POLICY "Allow authenticated updates" ON storage.objects
  FOR UPDATE TO authenticated
  WITH CHECK (bucket_id = 'nikah_documents');

-- Política para permitir deletes (remover arquivos)
CREATE POLICY "Allow authenticated deletes" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'nikah_documents');
