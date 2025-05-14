import React from 'react'
import { Link } from "react-router-dom"
import { useSelector } from "react-redux"
import { FaSquareXTwitter, FaSquareInstagram, FaYoutube, FaLinkedin, FaSquareYoutube } from "react-icons/fa6"
import Logo from "../IMG/Screenshot (6).png"

const Footer = () => {
    const { isAuthenticated } = useSelector(state => state.user)
    return (
        <>
            <footer>
                <div>
                    <img src={Logo} alt='logo'></img>
                </div>
                <div>
                    <h4>Support</h4>
                    <ul>
                        <li>ALL India</li>
                        <li>jobprovider@gmail.com</li>
                        <li>+91-9233000000</li>
                    </ul>
                </div>
                <div>
                    <h4>Quick Links</h4>
                    <ul>
                        <li><Link to={"/"}>Home</Link></li>
                        <li><Link to={"/jobs"}>Jobs</Link></li>
                        {
                            isAuthenticated && <li><Link to={"/dashboard"}>DeshBoard</Link></li>
                        }
                    </ul>
                </div>
                <div>
                    <h4>Follow Us</h4>
                    <ul>
                        <li>
                            <Link to={"/"}>
                                <span><FaSquareXTwitter /></span>
                                <span>Twitter (X)</span>
                            </Link>
                        </li>
                        <li>
                            <Link to={"/"}>
                                <span><FaSquareInstagram /></span>
                                <span>Instagram</span>
                            </Link>
                        </li>
                        <li>
                            <Link to={"/"}>
                                <span><FaSquareYoutube /></span>
                                <span>Youtube</span>
                            </Link>
                        </li>
                        <li>
                            <Link to={"/"}>
                                <span><FaLinkedin /></span>
                                <span>Linkedin</span>
                            </Link>
                        </li>
                    </ul>
                </div>
            </footer>
            <div className='copyright'>
                &copy; Copyright 2025. All Right Reserved.
            </div>
        </>
    )
}

export default Footer
