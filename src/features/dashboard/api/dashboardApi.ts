import {axiosInstance} from "../../../core/api/axiosInstance";


export const dashboardApi={
 getStats:()=>axiosInstance.get("/api/dashboard/statistiques"),
}