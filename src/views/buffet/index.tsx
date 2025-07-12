import "./index.css"

export default function Buffet(){
    return <>
        <h1>Buffet</h1>
        <div className="question-card">
            <div className="title">How to center a div?</div>
            <div className="metrics">
                <div className="votes">78</div>
                <div className="answers">4</div>
                <div className="views">241</div>
            </div>
            <div className="userinfo">
                <div className="username">miskette</div>
                <div className="profile">
                    <img src="https://www.gravatar.com/avatar/ff8fb2b91d470633184505d5e1f15366" 
                    alt="" className="profile-image" />
                </div>
                <div className="level">2</div>
            </div>
            <div className="date-time">12/24/2020 12:30:44 PM</div>
        </div>
    </>
}