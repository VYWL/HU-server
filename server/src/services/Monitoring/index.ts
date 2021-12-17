import getQ from '@/services/Monitoring/GET';
import postQ from '@/services/Monitoring/POST';
import deleteQ from '@/services/Monitoring/DELETE';
import putQ from '@/services/Monitoring/PUT'

export default {
    ...getQ,
    ...postQ,
    ...deleteQ,
    ...putQ
};
