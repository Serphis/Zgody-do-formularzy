import { redirect } from '@remix-run/node'
import { Form, NavLink, useLoaderData } from "@remix-run/react";
import { db } from '../services/index.js'
import { z } from 'zod'
import { useState } from 'react';
import { Agreement, User, UserAgreement } from '@prisma/client';

export async function loader() {
    const agreements = await db.agreement.findMany()
    const users = await db.user.findMany()
    const userAgreements = await db.userAgreement.findMany()
    return {
        data: agreements, users, userAgreements
    }
}

export const emailSchema = z.object({
    email: z.string().email().min(1)
})

export async function action({ request }){
    const formData = await request.formData()
    const entries = Object.fromEntries(formData.entries())

    const { error, success, data } = emailSchema.safeParse(entries)

    let { _action, ...values } = Object.fromEntries(formData)

    if (!success) {
        throw new Response("Not allowed", {
            status: 400
        })
    }
    
    if (_action === "createForm") {

        var checkedAgreements = formData.getAll('checked')

        console.log(data.email)
        

        var userExists = await db.user.findMany({ //szukanie usera o podanym emailu
            where: {
                email: {
                    equals: data.email,
                },
            },
        })
        

        if (userExists[0]){ //jeżeli user istnieje w bazie

            for (var checkedAgreement of checkedAgreements) {
                await db.userAgreement.create({ //tworzenie form z istniejącym user
                    data: {
                        user: {
                            connect: { email: data.email },
                        },
                        agreement: {
                            connect: { content: checkedAgreement },
                        },
                    },
                })
            }
        }
        else { //jeżeli usera nie ma w bazie
            
            var createUser = await db.user.create({ //tworzenie nowego user z wpisanym emailem
                data: { 
                    email: data.email
                },
            })

            for (var checkedAgreement of checkedAgreements) { //powiązanie usera z wybranymi zgodami
                await db.userAgreement.create({
                    data: {
                        user: {
                            connectOrCreate: {
                                create: {
                                    email: data.email
                                },
                                where: {
                                    email: data.email
                                }
                            }
                        },
                        agreement: {
                            connect: {
                                content: checkedAgreement
                            }
                        }
                    }
                })
            }
        }
    }

    return redirect('/home')
}

async function createBasicAgreements(){

    let basicAgreements: string[] = [
        "Wyrażam zgodę na przetwarzanie moich danych osobowych w celu utworzenia i zarządzania moim kontem.",
        "Wyrażam zgodę na przetwarzanie moich danych osobowych w celach analitycznych.",
        "Wyrażam zgodę na otrzymywanie powiadomień email, takich jak aktualizacje, nowości i informacje marketingowe.",
        "Wyrażam zgodę na przetwarzanie moich danych osobowych w celach marketingowych."
    ]

    for (var basicAgreement in basicAgreements) {

        var basicAgreementExists = await db.agreement.findMany({
            where: {
                content: {
                    equals: basicAgreements[basicAgreement]
                },
            },
        })

        if (!basicAgreementExists[0]){
            await db.agreement.create({
                data: {
                    content: basicAgreements[basicAgreement]
                }
            })
        }
    }
}

export default function(){
    const { data: Agreements, Users, userAgreements } = useLoaderData();
    const [checkedValues, setValue] = useState([])

    createBasicAgreements()

    function handleChange(event){
        const {value, checked} = event.target

        if(checked){
            setValue(pre => [...pre, value])
        }else{
            setValue(pre =>{
                return [...pre.filter(agreementcontent => agreementcontent!==value)]
            })
        }
    }

    return (
        <main className="flex font-serif">
            <form method="post">
                <div className="w-4/5 p-4 ring-1 ring-slate-300 rounded-md">
                    <header>
                        <div className="flex items-center justify-between">
                            <div className="font-semibold text-slate-800 ml-2 text-xl">
                                Zgody
                            </div>
                            <NavLink to="/create">
                            <div className="hover:bg-slate-200 bg-slate-100 text-slate-800 text-sm w-full px-2 py-2 ring-1 ring-slate-300 shadow-md rounded-sm flex items-center">
                                    <svg width="20" height="20" fill="currentColor" className="mr-2" aria-hidden="true">
                                    <path d="M10 5a1 1 0 0 1 1 1v3h3a1 1 0 1 1 0 2h-3v3a1 1 0 1 1-2 0v-3H6a1 1 0 1 1 0-2h3V6a1 1 0 0 1 1-1Z" />
                                    </svg>
                                    Nowa zgoda
                                </div>
                            </NavLink>
                        </div>
                        <div className="mt-20 h-7">
                            <input type="text" name="email" className="focus:ring-2 focus:ring-black-500 focus:outline-none appearance-none
                                text-slate-900 placeholder-slate-400 pl-3 ring-1 ring-slate-300 shadow-md rounded-sm sm:w-full w-11/12 h-full" placeholder="Email" required/>
                        </div>
                        <div className="mt-4">
                            {Agreements.length ? (
                                <ul>
                                    {Agreements.map((Agreement: Agreement) => (
                                        <li key={Agreement.id}>
                                            <div className="flex items-center justify-start ring-1 ring-slate-300 bg-slate-100 text-slate-600 rounded-sm shadow-md">
                                                <input type="checkbox" value={ Agreement.content } name="checked" onChange={handleChange} className="ml-2"/>{" "}
                                                <div className="mx-3 my-2">
                                                    {Agreement.content}
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div>Nobody here!</div>
                            )}
                        </div>
                        <div className="flex justify-end mt-4">
                            <button 
                                type="submit"
                                aria-label="createForm"
                                name="_action"
                                value="createForm"
                                className="hover:bg-slate-600 bg-slate-800 text-white text-sm font-medium px-8 py-2 rounded-sm shadow-md">
                                    Zatwierdź
                            </button>
                        </div>
                    </header>
                </div>
            </form>
        </main>
    );
}