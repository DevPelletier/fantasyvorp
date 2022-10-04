import React, {useState, useEffect} from 'react';
// import Image from 'next/image' // TODO: Add Images later! Wow what a concept
import Link from 'next/link'

import SegmentSharpIcon from '@mui/icons-material/SegmentSharp';
import CloseSharpIcon from '@mui/icons-material/CloseSharp';
import LeaderboardSharpIcon from '@mui/icons-material/LeaderboardSharp';
import InsightsSharpIcon from '@mui/icons-material/InsightsSharp';
import ShowChartSharpIcon from '@mui/icons-material/ShowChartSharp';
import BarChartSharpIcon from '@mui/icons-material/BarChartSharp';
import RawOnSharpIcon from '@mui/icons-material/RawOnSharp';

export default function Section() {
    const [mobileNav, setMobileNav] = useState(false);
    const [dropdown_faq, setDropdown_faq] = useState(false);

    const toggleMobileNav = () => setMobileNav(!mobileNav);
    const toggleDropdown_faq = () => setDropdown_faq(!dropdown_faq);

    
    return (

        <nav className="navbar">
            <div className="inner-section navbar-container">
                <div className="text-logo-container img-width-sm-02">
                    <Link href="/">
                        <h1 className="logoFont">fantasyVORP</h1>
                    </Link>
                </div>
                <div className="nav-menu-container">
                    <div className="navBurger" onClick={toggleMobileNav}>
                        <SegmentSharpIcon className={`${ mobileNav ? "hideIcon" : "showIcon" }`}/>
                        <CloseSharpIcon className={`${ mobileNav ? "showIcon" : "hideIcon" }`}/>
                    </div>
                    <ul className={`nav-menu ${ mobileNav ? "active" : ""}`}>
                        <li className="nav-item">
                            <Link href="/">
                                <a className="btn">VORP</a>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link href="/coming-soon">
                                <a className="btn">Raw Stats</a>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link href="/coming-soon">
                                <a className="btn">Live Stats</a>
                            </Link>
                        </li>
                        <li className="nav-item" 
                        onMouseEnter={() => setDropdown_faq(true)}
                        onMouseLeave={() => setDropdown_faq(false)}
                        >
                            <Link href="/faqs-and-tutorial">
                                <a className="btn">FAQ</a>
                            </Link>
                            <ul className={`subMenu ${ dropdown_faq ? "active" : "" }`}>
                                <li className="subMenu-item">
                                    <Link href="/faqs-and-tutorial">
                                        <a className="btn">VORP 101</a>
                                    </Link>
                                </li>
                                <li className="subMenu-item">
                                    <Link href="/faqs-and-tutorial#faqs">
                                        <a className="btn">VORP in Detail</a>
                                    </Link>
                                </li>
                                <li className="subMenu-item">
                                    <Link href="/faqs-and-tutorial#faqs">
                                        <a className="btn">The Projections</a>
                                    </Link>
                                </li>
                                <li className="subMenu-item">
                                    <Link href="/faqs-and-tutorial#faqs">
                                        <a className="btn">Features</a>
                                    </Link>
                                </li>
                            </ul>
                        </li>
                        <li className="nav-item">
                            <Link href="/contact">
                                <a className="btn">Contact</a>
                            </Link>
                        </li>
                    </ul>

                    <ul className="subNav-menu">
                        <li className="subNav-item">
                            <Link href="/">
                            <a>
                                <InsightsSharpIcon />                
                                <span>VORP</span>
                            </a>
                            </Link>
                        </li>
                        <li className="subNav-item">
                            <Link href="/coming-soon">
                            <a>
                                <RawOnSharpIcon />
                                <span>Raw Stats</span>
                            </a>
                            </Link>
                        </li>
                        <li className="subNav-item">
                            <Link href="/coming-soon">
                            <a>
                                <BarChartSharpIcon />
                                <span>Live VORP</span>
                            </a>
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    )
}
