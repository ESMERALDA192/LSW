import { repository } from '../../../api/repository.js';
export const getInstitutesAll = () => repository.list('institutes');
export const saveInstitute = record => repository.save('institutes', record);
export const deleteInstitute = id => repository.remove('institutes', id);
