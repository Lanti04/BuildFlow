import { useState, useEffect } from 'react';
import { Plus, Phone, Mail, MapPin, Trash2, Edit } from 'lucide-react';
import { getAllContacts, saveContact, deleteContact } from '../utils/storage';
import { Contact } from '../types';

export default function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Contact>({
    id: '',
    name: '',
    phone: '',
    email: '',
    address: '',
  });

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    const allContacts = await getAllContacts();
    setContacts(allContacts);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return;

    const contact: Contact = {
      ...formData,
      id: formData.id || `contact-${Date.now()}`,
    };

    await saveContact(contact);
    setFormData({ id: '', name: '', phone: '', email: '', address: '' });
    setIsAdding(false);
    setEditingId(null);
    loadContacts();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this contact?')) {
      await deleteContact(id);
      loadContacts();
    }
  };

  const handleEdit = (contact: Contact) => {
    setFormData(contact);
    setEditingId(contact.id);
    setIsAdding(true);
  };

  const handleSelectFromDevice = async () => {
    try {
      const { getDeviceContacts, isNative } = await import('../utils/native');
      
      if (!isNative) {
        alert('Contact selection is only available in the native app. Please install the iOS/Android app.');
        return;
      }

      const deviceContacts = await getDeviceContacts();
      
      if (deviceContacts.length === 0) {
        alert('No contacts found on device.');
        return;
      }

      // Show contact selection dialog (simplified - you could create a proper modal)
      const contactNames = deviceContacts.map(c => c.name).join('\n');
      const selectedName = prompt(`Select a contact:\n\n${contactNames}\n\nEnter contact name:`);
      
      if (selectedName) {
        const selectedContact = deviceContacts.find(c => c.name === selectedName);
        if (selectedContact) {
          setFormData(selectedContact);
          setIsAdding(true);
          setEditingId(null);
        }
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
      alert('Failed to load contacts. Please check permissions.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-600 mt-1">Manage client contacts</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSelectFromDevice}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Import from Device
          </button>
          <button
            onClick={() => {
              setIsAdding(true);
              setEditingId(null);
              setFormData({ id: '', name: '', phone: '', email: '', address: '' });
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Contact
          </button>
        </div>
      </div>

      {/* Add/Edit Form */}
      {isAdding && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {editingId ? 'Edit Contact' : 'Add New Contact'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Client Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="client@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="123 Main St, City, State ZIP"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-6">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setEditingId(null);
                setFormData({ id: '', name: '', phone: '', email: '', address: '' });
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Contacts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contacts.map((contact) => (
          <div
            key={contact.id}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {contact.name}
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              {contact.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{contact.phone}</span>
                </div>
              )}
              {contact.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{contact.email}</span>
                </div>
              )}
              {contact.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{contact.address}</span>
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => handleEdit(contact)}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => handleDelete(contact.id)}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {contacts.length === 0 && !isAdding && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <p className="text-gray-600">No contacts yet. Add your first contact to get started.</p>
        </div>
      )}
    </div>
  );
}

