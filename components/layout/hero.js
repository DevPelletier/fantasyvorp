import React, {useState, useEffect} from 'react';
import Link from 'next/link'
import styles from '../../styles/components/layout/Hero.module.scss'


import Button from '@mui/material/Button';


export default function Section() {
    return (
    <section className={styles.hero}>
        <div className={styles.contentContainer}>
            <h1>
                Welcome to the <span className={styles.logoFont}>FantasyVORP.com</span> beta!
            </h1>

            <Button variant="contained" type="submit" value="Submit">Pick your League Settings</Button>
        </div>
    </section>
    )
}