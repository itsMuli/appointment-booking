import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { artistAPI } from '../../services/adminApi';

const emptyForm = { name: '', specialty: '', experience: '', image: '' };

const AdminArtists = () => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await artistAPI.getAll();
      setArtists(res.data.artists || []);
    } catch (err) {
      toast.error('Failed to load artists');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const reset = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const startEdit = (artist) => {
    setEditingId(artist._id);
    setForm({
      name: artist.name || '',
      specialty: artist.specialty || '',
      experience: artist.experience || '',
      image: artist.image || '',
    });
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Name is required');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await artistAPI.update(editingId, form);
        toast.success('Artist updated');
      } else {
        await artistAPI.create(form);
        toast.success('Artist created');
      }
      reset();
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this artist?')) return;
    try {
      await artistAPI.delete(id);
      toast.success('Artist deleted');
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="prata-regular text-2xl text-gray-900">Artists</h2>
        <p className="text-sm text-gray-500 mt-1">Manage salon staff</p>
      </div>

      <form onSubmit={save} className="bg-white border border-stone-200 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          className="px-3 py-2 border border-stone-200 rounded-lg text-sm"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          required
        />
        <input
          className="px-3 py-2 border border-stone-200 rounded-lg text-sm"
          placeholder="Specialty"
          value={form.specialty}
          onChange={(e) => setForm((f) => ({ ...f, specialty: e.target.value }))}
        />
        <input
          className="px-3 py-2 border border-stone-200 rounded-lg text-sm"
          placeholder="Experience"
          value={form.experience}
          onChange={(e) => setForm((f) => ({ ...f, experience: e.target.value }))}
        />
        <input
          className="px-3 py-2 border border-stone-200 rounded-lg text-sm"
          placeholder="Image URL"
          value={form.image}
          onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
        />
        <div className="sm:col-span-2 flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-primary text-white text-sm rounded-lg disabled:opacity-50"
          >
            {editingId ? 'Update artist' : 'Add artist'}
          </button>
          {editingId && (
            <button type="button" onClick={reset} className="px-4 py-2 border border-stone-200 text-sm rounded-lg">
              Cancel
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {artists.map((a) => (
            <div key={a._id} className="bg-white border border-stone-200 rounded-xl p-4 flex justify-between gap-3">
              <div>
                <p className="font-medium text-gray-900">{a.name}</p>
                <p className="text-sm text-gray-500">{a.specialty || '—'}</p>
                {a.experience && <p className="text-xs text-gray-400 mt-1">{a.experience}</p>}
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <button type="button" onClick={() => startEdit(a)} className="text-xs text-primary hover:underline">
                  Edit
                </button>
                <button type="button" onClick={() => remove(a._id)} className="text-xs text-red-600 hover:underline">
                  Delete
                </button>
              </div>
            </div>
          ))}
          {artists.length === 0 && (
            <p className="text-sm text-gray-500 col-span-full text-center py-8">No artists yet.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminArtists;
