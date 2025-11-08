import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Camera, Edit, Phone, FileText, DollarSign, Clock, X, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SiteVisit, Photo, Contact } from '../types';
import { saveSiteVisit } from '../utils/storage';
import { uploadImageToS3 } from '../utils/s3';

interface DayCardProps {
  date: Date;
  visit?: SiteVisit;
  onUpdate: () => void;
  expanded?: boolean;
}

export default function DayCard({ date, visit, onUpdate, expanded = false }: DayCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(visit?.notes || '');
  const [estimatedCost, setEstimatedCost] = useState(visit?.estimatedCost?.toString() || '');
  const [estimatedDuration, setEstimatedDuration] = useState(visit?.estimatedDuration?.toString() || '');
  const [contact, setContact] = useState<Contact | null>(visit?.contact || null);
  const [photos, setPhotos] = useState<Photo[]>(visit?.photos || []);
  const [uploading, setUploading] = useState(false);

  // Update state when visit prop changes
  useEffect(() => {
    setNotes(visit?.notes || '');
    setEstimatedCost(visit?.estimatedCost?.toString() || '');
    setEstimatedDuration(visit?.estimatedDuration?.toString() || '');
    setContact(visit?.contact || null);
    setPhotos(visit?.photos || []);
  }, [visit]);

  const handleSave = async () => {
    const visitData: SiteVisit = {
      id: visit?.id || `visit-${Date.now()}`,
      date: format(date, 'yyyy-MM-dd'),
      photos,
      notes,
      contact,
      estimatedCost: estimatedCost ? parseFloat(estimatedCost) : null,
      estimatedDuration: estimatedDuration ? parseFloat(estimatedDuration) : null,
      createdAt: visit?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveSiteVisit(visitData);
    setIsEditing(false);
    onUpdate();
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const newPhotos: Photo[] = [];

      for (const file of Array.from(files)) {
        // Create thumbnail for immediate display
        const thumbnailUrl = URL.createObjectURL(file);
        
        try {
          // Try to upload to S3 (if backend is available)
          const s3Url = await uploadImageToS3(file, 'photos');
          
          const photo: Photo = {
            id: `photo-${Date.now()}-${Math.random()}`,
            url: s3Url,
            thumbnailUrl: s3Url, // Use S3 URL for thumbnail too
            filename: file.name,
            size: file.size,
            uploadedAt: new Date().toISOString(),
          };
          
          newPhotos.push(photo);
        } catch (error) {
          // Fallback to local storage if S3 upload fails
          console.warn('S3 upload failed, using local storage:', error);
          const localUrl = URL.createObjectURL(file);
          
          const photo: Photo = {
            id: `photo-${Date.now()}-${Math.random()}`,
            url: localUrl,
            thumbnailUrl,
            filename: file.name,
            size: file.size,
            uploadedAt: new Date().toISOString(),
          };
          
          newPhotos.push(photo);
        }
      }

      setPhotos([...photos, ...newPhotos]);
    } catch (error) {
      console.error('Error uploading photos:', error);
      alert('Error uploading photos. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = (photoId: string) => {
    setPhotos(photos.filter((p) => p.id !== photoId));
  };

  const dateStr = format(date, 'yyyy-MM-dd');
  const isToday = format(new Date(), 'yyyy-MM-dd') === dateStr;

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md ${
        isToday ? 'ring-2 ring-blue-500' : ''
      } ${expanded ? 'max-w-4xl' : ''}`}
    >
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">
              {format(date, 'EEEE, MMM d')}
            </h3>
            {isToday && (
              <span className="text-xs text-blue-600 font-medium">Today</span>
            )}
          </div>
          <div className="flex gap-2">
            <Link
              to={`/notepad/${dateStr}`}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-white rounded-lg transition-colors"
              title="Notepad"
            >
              <FileText className="w-5 h-5" />
            </Link>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-white rounded-lg transition-colors"
            >
              <Edit className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Photos */}
        {photos.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {photos.slice(0, expanded ? photos.length : 3).map((photo) => (
              <div key={photo.id} className="relative group">
                <img
                  src={photo.thumbnailUrl}
                  alt={photo.filename}
                  className="w-full h-24 object-cover rounded-lg"
                />
                {isEditing && (
                  <button
                    onClick={() => handleRemovePhoto(photo.id)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Upload Photos */}
        {isEditing && (
          <label className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
            <Camera className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-600">
              {uploading ? 'Uploading...' : 'Upload Photos'}
            </span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        )}

        {/* Notes Preview */}
        {!isEditing && notes && (
          <p className="text-sm text-gray-600 line-clamp-2">{notes}</p>
        )}

        {/* Edit Notes */}
        {isEditing && (
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add job description / notes..."
            className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
          />
        )}

        {/* Contact Info */}
        {contact && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="w-4 h-4" />
            <span>{contact.name}</span>
            {contact.phone && <span className="text-gray-400">•</span>}
            {contact.phone && <span>{contact.phone}</span>}
          </div>
        )}

        {/* Edit Contact */}
        {isEditing && (
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Client Name"
              value={contact?.name || ''}
              onChange={(e) => setContact({ ...contact, id: contact?.id || 'contact-1', name: e.target.value, phone: contact?.phone || '', email: contact?.email || '', address: contact?.address || '' } as Contact)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="tel"
              placeholder="Phone"
              value={contact?.phone || ''}
              onChange={(e) => setContact({ ...contact, id: contact?.id || 'contact-1', name: contact?.name || '', phone: e.target.value, email: contact?.email || '', address: contact?.address || '' } as Contact)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="email"
              placeholder="Email"
              value={contact?.email || ''}
              onChange={(e) => setContact({ ...contact, id: contact?.id || 'contact-1', name: contact?.name || '', phone: contact?.phone || '', email: e.target.value, address: contact?.address || '' } as Contact)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Address"
              value={contact?.address || ''}
              onChange={(e) => setContact({ ...contact, id: contact?.id || 'contact-1', name: contact?.name || '', phone: contact?.phone || '', email: contact?.email || '', address: e.target.value } as Contact)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Cost and Duration */}
        <div className="flex gap-4 text-sm">
          {estimatedCost && (
            <div className="flex items-center gap-1 text-gray-600">
              <DollarSign className="w-4 h-4" />
              <span>${estimatedCost}</span>
            </div>
          )}
          {estimatedDuration && (
            <div className="flex items-center gap-1 text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{estimatedDuration}h</span>
            </div>
          )}
        </div>

        {/* Edit Cost and Duration */}
        {isEditing && (
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs text-gray-600 mb-1">Estimated Cost</label>
              <input
                type="number"
                placeholder="0.00"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-600 mb-1">Duration (hours)</label>
              <input
                type="number"
                placeholder="0"
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {/* Save Button */}
        {isEditing && (
          <button
            onClick={handleSave}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save Changes
          </button>
        )}
      </div>
    </div>
  );
}

