import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar, MapPin, Users, CreditCard, FileText, Upload } from "lucide-react";

interface HajjUmrahApplicationFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const HajjUmrahApplicationForm = ({ onSuccess, onCancel }: HajjUmrahApplicationFormProps) => {
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    nationality: "",
    passportNumber: "",
    passportExpiry: "",
    
    // Pilgrimage Details
    pilgrimageType: "",
    preferredDate: "",
    packageType: "",
    accommodationType: "",
    
    // Health Information
    bloodGroup: "",
    medicalConditions: "",
    medications: "",
    disabilities: "",
    
    // Emergency Contact
    emergencyName: "",
    emergencyRelation: "",
    emergencyPhone: "",
    
    // Additional Information
    specialRequests: "",
    previousHajj: "",
    mahramRelation: "",
    
    // Documents
    documents: [] as File[],
    
    // Agreement
    termsAccepted: false,
    healthDeclaration: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      onSuccess();
    }, 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Application Form</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-600" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Pilgrimage Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-600" />
              Pilgrimage Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pilgrimageType">Pilgrimage Type *</Label>
                <Select value={formData.pilgrimageType} onValueChange={(value) => handleInputChange("pilgrimageType", value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select pilgrimage type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hajj">Hajj</SelectItem>
                    <SelectItem value="umrah">Umrah</SelectItem>
                    <SelectItem value="hajj-umrah">Hajj & Umrah</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="packageType">Package Type *</Label>
                <Select value={formData.packageType} onValueChange={(value) => handleInputChange("packageType", value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select package" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="economy">Economy</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Health Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-600" />
              Health Information
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="medicalConditions">Medical Conditions</Label>
                <Textarea
                  id="medicalConditions"
                  placeholder="Please describe any medical conditions"
                  value={formData.medicalConditions}
                  onChange={(e) => handleInputChange("medicalConditions", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="medications">Current Medications</Label>
                <Textarea
                  id="medications"
                  placeholder="List any medications you are currently taking"
                  value={formData.medications}
                  onChange={(e) => handleInputChange("medications", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="w-5 h-5 text-teal-600" />
              Emergency Contact
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergencyName">Emergency Contact Name *</Label>
                <Input
                  id="emergencyName"
                  value={formData.emergencyName}
                  onChange={(e) => handleInputChange("emergencyName", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyPhone">Emergency Contact Phone *</Label>
                <Input
                  id="emergencyPhone"
                  value={formData.emergencyPhone}
                  onChange={(e) => handleInputChange("emergencyPhone", e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Agreements */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-teal-600" />
              Agreements
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="termsAccepted"
                  checked={formData.termsAccepted}
                  onCheckedChange={(checked) => handleInputChange("termsAccepted", checked as boolean)}
                  required
                />
                <Label htmlFor="termsAccepted" className="text-sm">
                  I accept the terms and conditions for Hajj/Umrah pilgrimage and understand the requirements.
                </Label>
              </div>
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="healthDeclaration"
                  checked={formData.healthDeclaration}
                  onCheckedChange={(checked) => handleInputChange("healthDeclaration", checked as boolean)}
                  required
                />
                <Label htmlFor="healthDeclaration" className="text-sm">
                  I declare that I am medically fit to perform the pilgrimage and have disclosed all relevant health information.
                </Label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-teal-600 hover:bg-teal-700"
            >
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default HajjUmrahApplicationForm;
