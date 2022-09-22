import Head from 'next/head'
import styles from '../styles/Home.module.scss'

import { useState, useEffect } from 'react'
import Link from 'next/link'

import MiniHero from '../components/layout/miniHero'
import FAQs from '../components/faq'
// import DashGraph from '../components/dashGraph' // To implement later - NON MVP



export default function Page() {

    let headlineText = "How does this work?"

    return (
        <div className={styles.container}>
            <main className={styles.main}>

                <MiniHero headline={headlineText} />
                <FAQs />


            </main>
        </div>

    )
}
