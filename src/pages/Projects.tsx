import { useState, useEffect } from 'react';
import { FolderKanban, Calendar, DollarSign } from 'lucide-react';
import { getAllSiteVisits } from '../utils/storage';
import { SiteVisit } from '../types';
import { format } from 'date-fns';

export default function Projects() {
  const [visits, setVisits] = useState<SiteVisit[]>([]);

  useEffect(() => {
    loadVisits();
  }, []);

  const loadVisits = async () => {
    const allVisits = await getAllSiteVisits();
    setVisits(allVisits.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const totalCost = visits.reduce((sum, visit) => sum + (visit.estimatedCost || 0), 0);
  const totalDuration = visits.reduce((sum, visit) => sum + (visit.estimatedDuration || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
        <p className="text-gray-600 mt-1">Overview of all site visits and projects</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <FolderKanban className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total Visits</p>
              <p className="text-2xl font-bold text-gray-900">{visits.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Total Estimated Cost</p>
              <p className="text-2xl font-bold text-gray-900">${totalCost.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Total Hours</p>
              <p className="text-2xl font-bold text-gray-900">{totalDuration.toFixed(1)}h</p>
            </div>
          </div>
        </div>
      </div>

      {/* Visits List */}
      <div className="space-y-4">
        {visits.map((visit) => (
          <div
            key={visit.id}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {format(new Date(visit.date), 'EEEE, MMMM d, yyyy')}
                  </h3>
                  {visit.contact && (
                    <span className="text-sm text-gray-600">{visit.contact.name}</span>
                  )}
                </div>
                {visit.notes && (
                  <p className="text-gray-600 mb-4 line-clamp-2">{visit.notes}</p>
                )}
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  {visit.estimatedCost && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      <span>${visit.estimatedCost.toFixed(2)}</span>
                    </div>
                  )}
                  {visit.estimatedDuration && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{visit.estimatedDuration}h</span>
                    </div>
                  )}
                  {visit.photos.length > 0 && (
                    <div className="flex items-center gap-1">
                      <span>{visit.photos.length} photo(s)</span>
                    </div>
                  )}
                </div>
              </div>
              {visit.photos.length > 0 && (
                <div className="ml-4">
                  <img
                    src={visit.photos[0].thumbnailUrl}
                    alt="Thumbnail"
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {visits.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <p className="text-gray-600">No site visits yet. Start by adding a visit from the Dashboard.</p>
        </div>
      )}
    </div>
  );
}

