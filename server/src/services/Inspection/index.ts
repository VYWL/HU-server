import express from 'express'
import getQ from '@/services/Inspection/GET'
import postQ from '@/services/Inspection/POST'
import putQ from '@/services/Inspection/PUT'
import deleteQ from '@/services/Inspection/DELETE'

export default {
    ...getQ,
    ...postQ,
    ...putQ,
    ...deleteQ,
}