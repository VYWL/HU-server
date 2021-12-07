import getQ from '@/services/Policy/GET';
import postQ from '@/services/Policy/POST';
import putQ from '@/services/Policy/PUT';
import deleteQ from '@/services/Policy/DELETE';

export default {
    ...getQ,
    ...postQ,
    ...putQ,
    ...deleteQ,
};
