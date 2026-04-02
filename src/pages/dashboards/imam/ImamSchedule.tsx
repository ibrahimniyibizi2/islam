import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, Plus, Clock, MapPin, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ScheduleItem {
  id: string;
  title: string;
  description?: string;
  event_date: string;
  event_time: string;
  event_type: string;
  location?: string;
  mosque_id?: string;
  created_at: string;
  mosques?: { name: string };
}

export default function ImamSchedule() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [mosques, setMosques] = useState<{ id: string; name: string }[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    event_time: '',
    event_type: 'other' as string,
    location: '',
    mosque_id: '',
  });

  useEffect(() => {
    fetchScheduleItems();
    fetchMosques();
  }, [user, currentMonth]);

  const fetchScheduleItems = async () => {
    try {
      setLoading(true);
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

      const { data, error } = await supabase
        .from('imam_schedule')
        .select(`
          *,
          mosques (name)
        `)
        .eq('imam_id', user?.id)
        .gte('event_date', startOfMonth.toISOString())
        .lte('event_date', endOfMonth.toISOString())
        .order('event_date', { ascending: true });

      if (error) throw error;
      const formattedData = (data || []).map((item: any) => ({
        ...item,
        event_type: item.event_type as 'nikah' | 'sermon' | 'counseling' | 'other',
      }));
      setScheduleItems(formattedData);
    } catch (error) {
      console.error('Error fetching schedule:', error);
      toast({
        title: 'Error',
        description: 'Failed to load schedule items',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMosques = async () => {
    try {
      const { data, error } = await supabase.from('mosques').select('id, name');
      if (error) throw error;
      setMosques(data || []);
    } catch (error) {
      console.error('Error fetching mosques:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const itemData = {
        ...formData,
        imam_id: user.id,
      };

      if (editingItem) {
        const { error } = await supabase
          .from('imam_schedule')
          .update(itemData)
          .eq('id', editingItem.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Schedule item updated successfully',
        });
      } else {
        const { error } = await supabase.from('imam_schedule').insert(itemData);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Schedule item created successfully',
        });
      }

      setIsDialogOpen(false);
      setEditingItem(null);
      resetForm();
      fetchScheduleItems();
    } catch (error) {
      console.error('Error saving schedule item:', error);
      toast({
        title: 'Error',
        description: 'Failed to save schedule item',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this schedule item?')) return;

    try {
      const { error } = await supabase.from('imam_schedule').delete().eq('id', id);
      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Schedule item deleted successfully',
      });
      fetchScheduleItems();
    } catch (error) {
      console.error('Error deleting schedule item:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete schedule item',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (item: ScheduleItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || '',
      event_date: item.event_date,
      event_time: item.event_time,
      event_type: item.event_type,
      location: item.location || '',
      mosque_id: item.mosque_id || '',
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingItem(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      event_date: '',
      event_time: '',
      event_type: 'other' as string,
      location: '',
      mosque_id: '',
    });
  };

  const getEventTypeColor = (type: string) => {
    const colors = {
      nikah: 'bg-pink-100 text-pink-800',
      sermon: 'bg-blue-100 text-blue-800',
      counseling: 'bg-green-100 text-green-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Schedule</h2>
          <p className="text-muted-foreground">Manage your events and appointments</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Event
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => navigateMonth('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(new Date())}
              >
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={() => navigateMonth('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {scheduleItems.length === 0 ? (
            <div className="py-8 text-center">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">No events scheduled for this month</p>
              <Button className="mt-4" onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Event
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {scheduleItems.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getEventTypeColor(item.event_type)}`}>
                        {item.event_type}
                      </span>
                      <span className="font-medium">{item.title}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(item.event_date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {item.event_time}
                      </span>
                      {(item.location || item.mosques?.name) && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {item.location || item.mosques?.name}
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(item)}>
                      <Edit2 className="mr-1 h-4 w-4" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="mr-1 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Event' : 'Create New Event'}</DialogTitle>
            <DialogDescription>
              {editingItem ? 'Update event details' : 'Fill in the event information'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter event title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event_type">Event Type</Label>
              <Select
                value={formData.event_type}
                onValueChange={(value: string) =>
                  setFormData({ ...formData, event_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nikah">Nikah</SelectItem>
                  <SelectItem value="sermon">Sermon</SelectItem>
                  <SelectItem value="counseling">Counseling</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="event_date">Date</Label>
                <Input
                  id="event_date"
                  type="date"
                  value={formData.event_date}
                  onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="event_time">Time</Label>
                <Input
                  id="event_time"
                  type="time"
                  value={formData.event_time}
                  onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mosque">Mosque (Optional)</Label>
              <Select
                value={formData.mosque_id}
                onValueChange={(value) => setFormData({ ...formData, mosque_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a mosque" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {mosques.map((mosque) => (
                    <SelectItem key={mosque.id} value={mosque.id}>
                      {mosque.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location (Optional)</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Enter location if different from mosque"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter event description..."
                className="w-full min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editingItem ? 'Update' : 'Create'} Event</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
