import getQ from '@/services/Network/GET';
import postQ from '@/services/Network/POST';
import putQ from '@/services/Network/PUT';
import deleteQ from '@/services/Network/DELETE';

export default {
    ...getQ,
    ...postQ,
    ...putQ,
    ...deleteQ,
};
