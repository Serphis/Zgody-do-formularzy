import { redirect } from '@remix-run/node'
import { Form, NavLink, useLoaderData } from "@remix-run/react";
import { db } from '../services/index.js'
import { z } from 'zod'
import { useState } from 'react';
import { Agreement, CompletedForm, User, FormExample } from '@prisma/client';

export async function loader() {
    // SELECT * FROM "Zgody"
    const agreements = await db.agreement.findMany()
    const users = await db.user.findMany()
    const completedForms = await db.completedForm.findMany()
    const formExamples = await db.formExample.findMany()
    return {
        data: agreements, users, completedForms, formExamples
    }
}

export const emailSchema = z.object({
    email: z.string().min(1)
})

export async function action({ request }){
    const formData = await request.formData()
    const body = Object.fromEntries(formData)

    const { error, success, data } = body

    // if (!success){
    //     //error handler
    //     return null
    // }
    // add to db
    // await db.user.create({
    //     data: data.email
    // })

    // const email = formData.get('email')
    // const checked = formData.getAll('checked')
    // const fields = {email, checked}

    //console.log(fields)

    console.log(formData.getAll('checked'))
    
    // if (!success){
    //     //error handler
    //     return null
    // }
    // await db.completedForm.create({ //nie działa tworzenie pełnego formularza
    //     data: {
    //         agreementlist: ['a', 'b'],
    //         user: {
    //             create: {
    //                 email: 'piotrnowak@gmail.com',
    //             },
    //         }
    //     }
    // })

    if (!formData.getAll('checked')){
        return null
    }
    await db.formExample.create({ //działa tworzenie pełnego formularza
        data: { listazgod: formData.getAll('checked')}
    })


    return redirect('/home')
}

export default function(){
    const { data: agreements, users, completedForms } = useLoaderData();
    const [checkedValues, setValue] = useState([])

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
    //console.log(checkedValues)

    return (
        <main>
            <p>
                <NavLink to="/create">
                    <button className="text-4xl">+</button>
                </NavLink>
            </p>
            <form method="post">
                <p>
                    {'Email'}<br/>
                    <input type="text" name="email" className="border border-black"/>
                </p>
                {agreements.length ? (
                    <ul>
                        {agreements.map((agreement: Agreement) => (
                            <li key={agreement.id}>
                                <input type="checkbox" value={ agreement.content } name="checked" onChange={handleChange}/>{" "}
                                {agreement.content}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Nobody here!</p>
                )}
                <p>
                    <button type="submit" name="_home" className="border border-black">Submit</button>
                </p>
                {completedForms.length ? (
                    <ul>
                        {completedForms.map((completedForm: CompletedForm) => (
                            <li key={completedForm.id}>
                                {completedForm.id}
                                {completedForm.userId}
                                {completedForm.agreementId}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Nobody here!</p>
                )}
            </form>
        </main>
    );
}