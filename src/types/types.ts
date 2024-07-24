import { NextFunction, Request, Response } from 'express'

export interface INewUserRequestBody {
   name: string
   email: string
   photo: string
   gender: string
   _id: string
   dob: Date
}

export type ControllerType = (
   req: Request,
   res: Response,
   next: NextFunction
) => Promise<void | Response<any, Record<string, any>>>

export interface INewProductRequestBody {
   name: string
   price: number
   stock: number
   category: string
}

export interface ISearchRequestQuery {
   search?: string
   price?: string
   category?: string
   sort?: string
   page?: string
}

export interface ISearchBaseQuery {
   name?: {
      $regex: string
      $options: string
   }
   price?: {
      $lte: number
   }
   category?: string
}

export type InvalidateCacheParam = {
   product?: boolean
   order?: boolean
   admin?: boolean
   userId?: string
   orderId?: string
   productId?: string | string[]
}
