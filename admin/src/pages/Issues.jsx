import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';

const StatusPill = ({ value }) => {
  const color = value === 'resolved' ? 'bg-green-100 text-green-700' : value === 'in_progress' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-700';
  return <span className={`px-2 py-0.5 rounded text-xs ${color}`}>{value}</span>
}

const Issues = ({ token }) => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(backendUrl + '/api/issue', {
        params: { status: status || undefined, q: q || undefined },
        headers: { token }
      });
      if (data.success) setIssues(data.issues);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchIssues(); /* eslint-disable-next-line */ }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.patch(backendUrl + `/api/issue/${id}`, { status: newStatus }, { headers: { token } });
      toast.success('Updated');
      fetchIssues();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const filtered = useMemo(() => issues, [issues]);

  return (
    <div>
      <div className='flex items-center justify-between mb-4'>
        <h2 className='text-xl font-semibold'>Issues</h2>
        <div className='flex gap-2'>
          <select value={status} onChange={e => setStatus(e.target.value)} className='border px-2 py-1'>
            <option value=''>All statuses</option>
            <option value='open'>Open</option>
            <option value='in_progress'>In Progress</option>
            <option value='resolved'>Resolved</option>
          </select>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder='Search email/subject/message' className='border px-2 py-1 w-64' />
          <button onClick={fetchIssues} className='bg-black text-white px-3'>Search</button>
        </div>
      </div>

      <div className='border rounded overflow-x-auto'>
        <table className='min-w-full text-sm'>
          <thead className='bg-gray-100 text-left'>
            <tr>
              <th className='p-2'>Created</th>
              <th className='p-2'>Subject</th>
              <th className='p-2'>Email</th>
              <th className='p-2'>Category</th>
              <th className='p-2'>Order ID</th>
              <th className='p-2'>Status</th>
              <th className='p-2 w-40'>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td className='p-3' colSpan={7}>Loading...</td></tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr><td className='p-3' colSpan={7}>No issues found</td></tr>
            )}
            {!loading && filtered.map((it) => (
              <tr key={it._id} className='border-t'>
                <td className='p-2 whitespace-nowrap'>{new Date(it.createdAt).toLocaleString()}</td>
                <td className='p-2'>{it.subject}
                  <div className='text-gray-500 text-xs line-clamp-2'>{it.message}</div>
                </td>
                <td className='p-2'>{it.email}</td>
                <td className='p-2'>{it.category}</td>
                <td className='p-2'>{it.orderId || '-'}</td>
                <td className='p-2'><StatusPill value={it.status} /></td>
                <td className='p-2'>
                  {it.status !== 'resolved' ? (
                    <div className='flex gap-2'>
                      <button onClick={() => updateStatus(it._id, 'open')} className='px-2 py-1 border'>Open</button>
                      <button onClick={() => updateStatus(it._id, 'in_progress')} className='px-2 py-1 border'>In Progress</button>
                      <button onClick={() => updateStatus(it._id, 'resolved')} className='px-2 py-1 border'>Resolved</button>
                    </div>
                  ) : (
                    <span className='text-gray-400 text-sm'>No actions</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Issues;
