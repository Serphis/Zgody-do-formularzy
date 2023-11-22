import { redirect } from '@remix-run/node'
import { Form, NavLink, useLoaderData } from "@remix-run/react";
import { db } from '../services/index.js'
import { z } from 'zod'

export async function loader() {
    // SELECT * FROM "Zgody"
    const agreements = await db.agreement.findMany()
    return {
        data: agreements
    }
}

export const agreementSchema = z.object({
    content: z.string().min(1)
})

export async function action({ request }){
    const formData = await request.formData()
    // const body = Object.fromEntries(formData.entries())

    // const { error, success, data } = agreementSchema.safeParse(body)

    // console.log('error', error, 'success', success, 'data', data)

    let { _action, ...values } = Object.fromEntries(formData)

    //add to db
    if (_action === "create") {
        await db.agreement.create({
            data: { 
                content: formData.getAll('contentInput')[0]
            }
        })
    }
    
    if (_action === "delete") {
        try{
            await db.agreement.delete({
                where: {
                    id: Number(values.id),
                    canBeRemoved: true
                }
            })
        }
        catch (error) {
            console.log(error)
        }
    }

    return redirect('/create')
}

export default function(){
    const { data: agreements } = useLoaderData();

    return (
        <main className="font-serif sm:w-3/5 w-4/5">
            <form method="post">
                <div className="p-4 ring-1 ring-slate-300 rounded-md">
                    <header>
                        <div className="flex items-center justify-between">
                            <div className="font-semibold text-slate-800 ml-2 text-xl">
                                Zgody
                            </div>
                            <NavLink to="/">
                                <div className="hover:bg-slate-200 bg-slate-100 text-slate-900 text-sm w-full px-4 py-2 ring-1 ring-slate-300 shadow-md rounded-sm">
                                    Powrót
                                </div>
                            </NavLink>
                        </div>
                        <div className="mt-20 h-7 grid grid-cols-6 justify-items-stretch gap-4">
                            <div className="col-span-5">
                                <input type="text" name="contentInput" className="focus:ring-2 focus:ring-black-500 focus:outline-none appearance-none
                                text-slate-900 placeholder-slate-400 pl-3 ring-1 ring-slate-300 shadow-md rounded-sm sm:w-11/12 w-10/12 h-full" placeholder="Treść zgody" required/>
                            </div>
                            <div className="col-span-1 justify-self-end">
                                <button 
                                    type="submit"
                                    name="_action"
                                    value="create"
                                    className="hover:bg-slate-200 bg-slate-100 text-slate-900 text-sm px-5 py-1 ring-1 ring-slate-300 shadow-md rounded-sm">
                                        Dodaj
                                </button>
                            </div>
                        </div>
                        <div className="mt-4">
                            {agreements.length ? (
                                <ul>
                                    {agreements.map((agreement) => (
                                        <li key={agreement.id}>
                                            <div className="flex items-center justify-between ring-1 ring-slate-300 bg-slate-100 text-slate-600 rounded-md shadow-md">
                                                <div className="mx-3 mt-2 mb-2">
                                                    {agreement.content}
                                                    {agreement.checked}
                                                    <input type="hidden" name="id" value={agreement.id} />
                                                    <input type="hidden" name="content" value={agreement.content} />
                                                </div>
                                                <div>
                                                    <button
                                                        type="submit"
                                                        aria-label="delete"
                                                        name="_action"
                                                        value="delete"
                                                        className="px-2 py-1 float-right">
                                                            <svg
                                                                className="h-6 w-6 text-slate-300 cursor-pointer"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                stroke="currentColor"
                                                                >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth="2"
                                                                    d="M6 18L18 6M6 6l12 12"
                                                                />
                                                            </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div>Nobody here!</div>
                            )}
                        </div>
                    </header>
                </div>
            </form>
        </main>
    );
}