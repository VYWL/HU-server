import net from 'net';
import { PROCESS_CODE, SERVICE_IP } from '@/config'
import { makeMsg } from '@/api'

export default async (HOST, mode, data) => {
    const client = new net.Socket();
    client.connect(9090, HOST, function () {
        if(mode === "init") {
            console.log(`[INFO] Connecting with HurryupAM :: HOST : ${HOST}`);

            const sendData = {
                ...data,
                server_ip : SERVICE_IP,
                server_port : 2031,
                server_file_port : 2032
            }
    
            const reqMsg = {
                protocol : PROCESS_CODE.SET_INIT_ENV,
                data : sendData
            }
    
            const reqString = makeMsg(JSON.stringify(reqMsg));
    
            client.write(reqString);
    
            console.log(`[INFO] Initializing data sent! (total ${reqString.length})`);
            console.log(`:: SERIAL_NUMBER = ${sendData.serial_number}`);
            console.log(`:: ENVIRONMENT = ${sendData.environment}`);
            
            client.destroy();
        }
        else if (mode === "start") {
            console.log(`[INFO] Starting Agent :: HOST : ${HOST}`);

            const reqMsg = {
                protocol : PROCESS_CODE.AGENT_START,
                data : {}
            }
    
            const reqString = makeMsg(JSON.stringify(reqMsg));
    
            client.write(reqString);
    
            console.log(`[INFO] Starting Signal Msg sent! (total ${reqString.length})`);
            
            client.destroy();
        }
        else if (mode === "stop") {
            console.log(`[INFO] Stopping Agent :: HOST : ${HOST}`);

            const reqMsg = {
                protocol : PROCESS_CODE.AGENT_STOP,
                data : {}
            }
    
            const reqString = makeMsg(JSON.stringify(reqMsg));
    
            client.write(reqString);
    
            console.log(`[INFO] Stopping Signal Msg sent! (total ${reqString.length})`);
            
            client.destroy();
        }

    });

    client.on('error', err => {
        console.log(err);
    })

}