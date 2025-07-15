import { useParams } from "react-router-dom";


export default function QA(){
    const {id} = useParams();
    return <>
        <h1>QA</h1>
        <h2>Question ID: {id}</h2>
    </>
}