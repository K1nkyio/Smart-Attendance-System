import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, 
  User, 
  BookOpen, 
  MapPin, 
  Hash, 
  Clock, 
  Phone, 
  Mail,
  Save
} from "lucide-react";
import { toast } from "sonner";

const ClassCreationForm = ({ onCreateClass, onCancel }) => {
  const [formData, setFormData] = useState({
    instructorName: '',
    className: '',
    location: '',
    unitCode: '',
    session: '',
    phoneNumber: '',
    email: '',
    description: '',
    capacity: '',
    department: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate required fields
    const requiredFields = ['instructorName', 'className', 'location', 'unitCode', 'session', 'phoneNumber', 'email'];
    const missingFields = requiredFields.filter(field => !formData[field].trim());

    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      setIsSubmitting(false);
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      setIsSubmitting(false);
      return;
    }

    // Create class object
    const newClass = {
      id: `CLS_${Date.now()}`,
      name: formData.className,
      instructor: formData.instructorName,
      location: formData.location,
      unitCode: formData.unitCode,
      schedule: formData.session,
      contact: {
        phone: formData.phoneNumber,
        email: formData.email
      },
      description: formData.description,
      capacity: parseInt(formData.capacity) || 50,
      department: formData.department || 'General',
      students: [], // Will be populated when students enroll
      createdAt: new Date().toISOString(),
      isActive: true
    };

    try {
      await onCreateClass(newClass);
      toast.success('Class created successfully!');
      
      // Reset form
      setFormData({
        instructorName: '',
        className: '',
        location: '',
        unitCode: '',
        session: '',
        phoneNumber: '',
        email: '',
        description: '',
        capacity: '',
        department: ''
      });
    } catch (error) {
      toast.error('Failed to create class. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const sessionOptions = [
    'Monday 8:00-10:00',
    'Monday 10:00-12:00',
    'Monday 14:00-16:00',
    'Tuesday 8:00-10:00',
    'Tuesday 10:00-12:00',
    'Tuesday 14:00-16:00',
    'Wednesday 8:00-10:00',
    'Wednesday 10:00-12:00',
    'Wednesday 14:00-16:00',
    'Thursday 8:00-10:00',
    'Thursday 10:00-12:00',
    'Thursday 14:00-16:00',
    'Friday 8:00-10:00',
    'Friday 10:00-12:00',
    'Friday 14:00-16:00'
  ];

  return (
    <Card className="glass-effect">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Plus className="h-5 w-5 mr-2 text-primary" />
          Create New Class
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Instructor Name */}
            <div className="space-y-2">
              <Label htmlFor="instructorName" className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                Instructor/Lecturer Name *
              </Label>
              <Input
                id="instructorName"
                value={formData.instructorName}
                onChange={(e) => handleInputChange('instructorName', e.target.value)}
                placeholder="Enter instructor name"
                required
              />
            </div>

            {/* Class Name */}
            <div className="space-y-2">
              <Label htmlFor="className" className="flex items-center">
                <BookOpen className="h-4 w-4 mr-1" />
                Lecture/Class Name *
              </Label>
              <Input
                id="className"
                value={formData.className}
                onChange={(e) => handleInputChange('className', e.target.value)}
                placeholder="Enter class name"
                required
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                Room Location/Code *
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="e.g., Room 101, Building A"
                required
              />
            </div>

            {/* Unit Code */}
            <div className="space-y-2">
              <Label htmlFor="unitCode" className="flex items-center">
                <Hash className="h-4 w-4 mr-1" />
                Class/Unit Code *
              </Label>
              <Input
                id="unitCode"
                value={formData.unitCode}
                onChange={(e) => handleInputChange('unitCode', e.target.value)}
                placeholder="e.g., CS101, MATH201"
                required
              />
            </div>

            {/* Session */}
            <div className="space-y-2">
              <Label className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Session Time *
              </Label>
              <Select onValueChange={(value) => handleInputChange('session', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select session time" />
                </SelectTrigger>
                <SelectContent>
                  {sessionOptions.map((session) => (
                    <SelectItem key={session} value={session}>
                      {session}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="flex items-center">
                <Phone className="h-4 w-4 mr-1" />
                Phone Number *
              </Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                placeholder="Enter phone number"
                type="tel"
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center">
                <Mail className="h-4 w-4 mr-1" />
                Email Address *
              </Label>
              <Input
                id="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter email address"
                type="email"
                required
              />
            </div>

            {/* Department */}
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                placeholder="e.g., Computer Science"
              />
            </div>

            {/* Capacity */}
            <div className="space-y-2">
              <Label htmlFor="capacity">Class Capacity</Label>
              <Input
                id="capacity"
                value={formData.capacity}
                onChange={(e) => handleInputChange('capacity', e.target.value)}
                placeholder="Maximum students (default: 50)"
                type="number"
                min="1"
                max="500"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Brief description of the class"
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                  Creating...
                </div>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Class
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ClassCreationForm;