import {axiosInstance} from "../../../core/api/axiosInstance";
import type {CategoryRequest} from "../types"

export const categorieApi={
getAll: ()=> axiosInstance.get("/api/categories"),
getById:(id:Number)=> axiosInstance.get(`/api/categories/${id}`),
create: (data:CategoryRequest)=>axiosInstance.post("/api/categories",data),
update: (id:number, data:CategoryRequest)=>axiosInstance.put(`/api/categories/${id}`,data),
delete: (id:number)=> axiosInstance.delete(`/api/categories/${id}`)

}