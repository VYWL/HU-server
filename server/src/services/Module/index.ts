import getQ from '@/services/Module/GET'
import postQ from '@/services/Module/POST'
import putQ from '@/services/Module/PUT'
import deleteQ from '@/services/Module/DELETE'

export default {
    ...getQ,
    ...postQ,
    ...putQ,
    ...deleteQ,
}