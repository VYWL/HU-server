import getQ from '@/services/Others/GET'
import postQ from '@/services/Others/POST'
import putQ from '@/services/Others/PUT'
import deleteQ from '@/services/Others/DELETE'

export default {
    ...getQ,
    ...postQ,
    ...putQ,
    ...deleteQ,
}
