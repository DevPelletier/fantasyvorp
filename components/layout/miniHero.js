import React, {useState, useEffect} from 'react';
import Link from 'next/link'
import styles from '../../styles/components/layout/miniHero.module.scss'

import Button from '@mui/material/Button';
import { style } from '@mui/system';


export default function Section(props) {
    return (
    <section className={styles.hero}>
        <div className={styles.contentContainer}>
            <h1 className={styles.headline}>
                {props.headline}
            </h1>
            {props.form}
        </div>
    </section>
    )
}