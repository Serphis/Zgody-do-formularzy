import { redirect } from '@remix-run/node'
import { Form, NavLink, useLoaderData } from "@remix-run/react";
import { db } from '../services/index.js'
import { z } from 'zod'
import { useState } from 'react';

export async function loader() {
    // SELECT * FROM "Zgody"
    const agreements = await db.agreement.findMany()
    const users = await db.user.findMany()
    return {
        data: agreements, users
    }
}

export const emailSchema = z.object({
    email: z.string().min(1)
})

export async function action({ request }){
    const formData = await request.formData()
    const body = Object.fromEntries(formData.entries())

    const { error, success, data } = emailSchema.safeParse(body)
    
    console.log('error', error, 'success', success, 'data', data)

    let { _action, ...values } = Object.fromEntries(formData)

    if (!success){
        //error handler
        return null
    }
    //add to db
    await db.user.create({
        data: data
    })

    return redirect('/')
}

export default function(){
    const { data: agreements, users } = useLoaderData();
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
    console.log(checkedValues)

    return (
        <main>
            <form method="post">
                <p>
                    {'Email'}<br/>
                    <input type="text" name="email" className="border border-black"/>
                </p>
                {agreements.length ? (
                    <ul>
                        {agreements.map((agreement) => (
                            <li key={agreement.id}>
                                <input type="checkbox" value={ agreement.id } name="checked" onChange={handleChange}/>{" "}
                                {agreement.content}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Nobody here!</p>
                )}
                <p>
                    <NavLink to="/create">
                        <button className="text-4xl">+</button>
                    </NavLink>
                </p>
                <p>
                    <button type="submit" name="_home" className="border border-black">Submit</button>
                </p>
                {users.length ? (
                    <ul>
                        {users.map((user) => (
                            <li key={user.id}>
                                {user.email}
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