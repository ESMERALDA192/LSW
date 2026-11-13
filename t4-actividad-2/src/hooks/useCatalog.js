import { useCallback, useEffect, useState } from 'react';
import { repository } from '../api/repository.js';
export function useCatalog(entity) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const reload = useCallback(async () => {
    setLoading(true); setError('');
    try { setRows(await repository.list(entity)); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [entity]);
  useEffect(() => { let active = true; setLoading(true); setError('');
    repository.list(entity).then(data => { if (active) setRows(data); }).catch(e => { if (active) setError(e.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [entity]);
  return { rows, loading, error, reload,
    save: async input => { const row = await repository.save(entity, input); await reload(); return row; },
    remove: async id => { await repository.remove(entity, id); await reload(); }
  };
}
