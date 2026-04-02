import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { BookOpen, Plus, Calendar, Clock, Edit2, Trash2, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Sermon {
  id: string;
  title: string;
  topic: string;
  content: string;
  date: string;
  time: string;
  mosque_id: string;
  language: string;
  status: 'draft' | 'scheduled' | 'delivered';
  created_at: string;
  mosques?: { name: string };
}

export default function ImamSermons() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [filteredSermons, setFilteredSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);
  const [mosques, setMosques] = useState<{ id: string; name: string }[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSermon, setEditingSermon] = useState<Sermon | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    topic: '',
    content: '',
    date: '',
    time: '',
    mosque_id: '',
    language: 'en',
    status: 'draft' as const,
  });

  useEffect(() => {
    fetchSermons();
    fetchMosques();
  }, [user]);

  useEffect(() => {
    if (filterStatus === 'all') {
      setFilteredSermons(sermons);
    } else {
      setFilteredSermons(sermons.filter((s) => s.status === filterStatus));
    }
  }, [sermons, filterStatus]);

  const fetchSermons = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sermons')
        .select(`
          *,
          mosques (name)
        `)
        .eq('imam_id', user?.id)
        .order('date', { ascending: false });

      if (error) throw error;
      setSermons(data || []);
      setFilteredSermons(data || []);
    } catch (error) {
      console.error('Error fetching sermons:', error);
      toast({
        title: 'Error',
        description: 'Failed to load sermons',
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
      const sermonData = {
        ...formData,
        imam_id: user.id,
      };

      if (editingSermon) {
        const { error } = await supabase
          .from('sermons')
          .update(sermonData)
          .eq('id', editingSermon.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Sermon updated successfully',
        });
      } else {
        const { error } = await supabase.from('sermons').insert(sermonData);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Sermon created successfully',
        });
      }

      setIsDialogOpen(false);
      setEditingSermon(null);
      resetForm();
      fetchSermons();
    } catch (error) {
      console.error('Error saving sermon:', error);
      toast({
        title: 'Error',
        description: 'Failed to save sermon',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this sermon?')) return;

    try {
      const { error } = await supabase.from('sermons').delete().eq('id', id);
      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Sermon deleted successfully',
      });
      fetchSermons();
    } catch (error) {
      console.error('Error deleting sermon:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete sermon',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (sermon: Sermon) => {
    setEditingSermon(sermon);
    setFormData({
      title: sermon.title,
      topic: sermon.topic,
      content: sermon.content,
      date: sermon.date,
      time: sermon.time,
      mosque_id: sermon.mosque_id,
      language: sermon.language,
      status: sermon.status,
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingSermon(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      topic: '',
      content: '',
      date: '',
      time: '',
      mosque_id: '',
      language: 'en',
      status: 'draft',
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      scheduled: 'bg-blue-100 text-blue-800',
      delivered: 'bg-green-100 text-green-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

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
          <h2 className="text-2xl font-bold">Sermons</h2>
          <p className="text-muted-foreground">Manage your sermons and khutbahs</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Sermon
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredSermons.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-8 text-center">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">No sermons found</p>
              <Button className="mt-4" onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Sermon
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredSermons.map((sermon) => (
            <Card key={sermon.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{sermon.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{sermon.topic}</p>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(sermon.status)}`}>
                    {sermon.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {new Date(sermon.date).toLocaleDateString()}
                  <Clock className="ml-2 h-4 w-4" />
                  {sermon.time}
                </div>
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Mosque:</span> {sermon.mosques?.name || 'Not specified'}
                </div>
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Language:</span>{' '}
                  {sermon.language === 'en' ? 'English' : sermon.language === 'ar' ? 'Arabic' : 'Kinyarwanda'}
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(sermon)}>
                    <Edit2 className="mr-1 h-4 w-4" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(sermon.id)}>
                    <Trash2 className="mr-1 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingSermon ? 'Edit Sermon' : 'Create New Sermon'}</DialogTitle>
            <DialogDescription>
              {editingSermon ? 'Update sermon details' : 'Fill in the sermon information'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter sermon title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                placeholder="Enter sermon topic"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mosque">Mosque</Label>
              <Select
                value={formData.mosque_id}
                onValueChange={(value) => setFormData({ ...formData, mosque_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a mosque" />
                </SelectTrigger>
                <SelectContent>
                  {mosques.map((mosque) => (
                    <SelectItem key={mosque.id} value={mosque.id}>
                      {mosque.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select
                value={formData.language}
                onValueChange={(value) => setFormData({ ...formData, language: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ar">Arabic</SelectItem>
                  <SelectItem value="rw">Kinyarwanda</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'draft' | 'scheduled' | 'delivered') =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Enter sermon content or notes..."
                rows={5}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editingSermon ? 'Update' : 'Create'} Sermon</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
