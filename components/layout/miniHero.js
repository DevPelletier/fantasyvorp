import React, {useState, useEffect} from 'react';
import Link from 'next/link'
import styles from '../../styles/components/layout/miniHero.module.scss'

import Button from '@mui/material/Button';


export default function Section(props) {
    return (
    <section className={styles.hero}>
        <div className={styles.contentContainer}>
            <h1>
                {props.headline}
            </h1>
        </div>
    </section>
    )
}