import React, {useState, useEffect} from 'react';
import Link from 'next/link'
import styles from '../../styles/components/layout/Footer.module.scss'

import Button from '@mui/material/Button';


export default function Section() {
    return (
        <footer className={styles.footer}>
            <div className={styles.footerLinksContainer}>
                <div className="">
                    <Link href="/">
                        <h2>FantasyVORP</h2>
                    </Link>
                </div>
                <ul className={styles.footerLinkList}>
                    {/* <li>
                        <h3>FooterTitle</h3>
                    </li> */}
                    <li>
                        <Link href="/how-does-this-work">
                            <a>FAQ & Help</a>
                        </Link>
                    </li>
                    <li>
                        <Link href="/changelog">
                            <a>Changelog</a>
                        </Link>
                    </li>
                    <li>
                        <Link href="/coming-soon">
                            <a>Paid Features</a>
                        </Link>
                    </li>
                    <li>
                        <Link href="https://www.buymeacoffee.com/fantasyvorp" target="_blank">
                            <a>Donate Link</a>
                        </Link>
                    </li>
                    <li>
                        <Link href="/contact">
                            <a>Contact</a>
                        </Link>
                    </li>
                </ul>
            </div>
        </footer>
    )
}