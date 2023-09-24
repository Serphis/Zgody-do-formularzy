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
    const body = Object.fromEntries(formData.entries())

    const { error, success, data } = agreementSchema.safeParse(body)

    console.log('error', error, 'success', success, 'data', data)

    let { _action, ...values } = Object.fromEntries(formData)

    if (!success){
        //error handler
        return null
    }
    //add to db
    await db.agreement.create({
        data: data
    })

    return redirect('/')
}

export default function(){
    const { data: agreements } = useLoaderData();

    return (
        <main>
            <form method="post">
                {agreements.length ? (
                    <ul>
                        {agreements.map((agreement) => (
                            <li key={agreement.id}>
                                {agreement.content}
                                {agreement.checked}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Nobody here!</p>
                )}
                <p>
                    {'Content'}<br/>
                    <input type="text" name="content" className="border border-black"/>
                    <button type="submit" name="_create" className="border border-black">Add</button>
                </p>
            </form>
        </main>
    );
}