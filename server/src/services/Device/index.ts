import express from 'express'
import getQ from '@/services/Device/GET'
import postQ from '@/services/Device/POST'
import putQ from '@/services/Device/PUT'
import deleteQ from '@/services/Device/DELETE'

export default {
    ...getQ,
    ...postQ,
    ...putQ,
    ...deleteQ,
}