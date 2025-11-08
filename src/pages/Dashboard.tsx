import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format, startOfWeek, addDays } from 'date-fns';
import { FileText } from 'lucide-react';
import { getAllSiteVisits } from '../utils/storage';
import { SiteVisit } from '../types';
import DayCard from '../components/DayCard';

export default function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [siteVisits, setSiteVisits] = useState<SiteVisit[]>([]);
  const [view, setView] = useState<'month' | 'week' | 'day'>('week');

  useEffect(() => {
    loadSiteVisits();
  }, []);

  const loadSiteVisits = async () => {
    const visits = await getAllSiteVisits();
    setSiteVisits(visits);
  };

  const getVisitsForDate = (date: Date): SiteVisit | undefined => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return siteVisits.find((visit) => visit.date === dateStr);
  };

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your site visits and daily activities</p>
        </div>
        <Link
          to="/notepad"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FileText className="w-5 h-5" />
          <span className="hidden md:inline">Notepad</span>
        </Link>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2">
        {(['month', 'week', 'day'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              view === v
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>

      {/* Calendar View */}
      {view === 'week' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setSelectedDate(addDays(selectedDate, -7))}
              className="px-4 py-2 bg-white rounded-lg hover:bg-gray-50"
            >
              Previous Week
            </button>
            <h2 className="text-xl font-semibold">
              {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
            </h2>
            <button
              onClick={() => setSelectedDate(addDays(selectedDate, 7))}
              className="px-4 py-2 bg-white rounded-lg hover:bg-gray-50"
            >
              Next Week
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {weekDays.map((day) => {
              const visit = getVisitsForDate(day);
              return (
                <DayCard
                  key={day.toISOString()}
                  date={day}
                  visit={visit}
                  onUpdate={loadSiteVisits}
                />
              );
            })}
          </div>
        </div>
      )}

      {view === 'day' && (
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setSelectedDate(addDays(selectedDate, -1))}
              className="px-4 py-2 bg-white rounded-lg hover:bg-gray-50"
            >
              Previous Day
            </button>
            <h2 className="text-xl font-semibold">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </h2>
            <button
              onClick={() => setSelectedDate(addDays(selectedDate, 1))}
              className="px-4 py-2 bg-white rounded-lg hover:bg-gray-50"
            >
              Next Day
            </button>
          </div>
          <DayCard
            date={selectedDate}
            visit={getVisitsForDate(selectedDate)}
            onUpdate={loadSiteVisits}
            expanded
          />
        </div>
      )}

      {view === 'month' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-gray-600 text-center py-8">
            Month view coming soon. Please use Week or Day view for now.
          </p>
        </div>
      )}
    </div>
  );
}

