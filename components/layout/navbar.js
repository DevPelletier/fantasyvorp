import React, {useState, useEffect} from 'react';
// import Image from 'next/image' // TODO: Add Images later! Wow what a concept
import Link from 'next/link'


export default function Section() {
    return (

        <nav className="navbar">
            <div className="inner-section navbar-container">
                <div className="text-logo-container img-width-sm-02">
                    <Link href="/">
                        <h1 className="logoFont">FantasyVORP</h1>
                    </Link>
                </div>
                <div className="nav-menu-container">
                    <ul className="nav-menu">
                        <li className="nav-item">
                            <Link href="/">
                                <a className="btn">VORP</a>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link href="/raw-stats">
                                <a className="btn">Raw Stats</a>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link href="/coming-soon">
                                <a className="btn">Live Stats</a>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link href="/how-does-this-work">
                                <a className="btn">FAQ</a>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link href="/contact">
                                <a className="btn">Contact</a>
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    )
}
