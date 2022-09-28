import '../styles/globals.scss'

// Components
import Head from 'next/head'
import Navbar from '../components/layout/navbar'
import Footer from '../components/layout/footer'
import Link from 'next/link'
import Image from 'next/image'
import img_bmc from '../public/bmc_icon_black.png'
import img_weblink from '../public/fantasyVORP-main-1.jpg'

import Script from 'next/script';


function MyApp({ Component, pageProps }) {
  return (
    <>
    <div className="underConstruction">
      <h1>Undergoing Maintenance!</h1>
      <h2>Apologies for the inconvenience - we&apos;ll be back shortly!</h2>
    </div>
    {/* <div className="mobileCover">
      <h1>Unfortunately this site is not formatted for mobile yet!</h1>
      <h2>Please view in a larger browser window</h2>
    </div> */}


    {/* Google Analytics Tag */}
    <Script id="ga-script-1" async src="https://www.googletagmanager.com/gtag/js?id=G-BDV80K8G13"></Script>
    <Script id="ga-script-2">
      {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());

        gtag('config', 'G-BDV80K8G13');
      `}
    </Script>

    <Head>
        <title>FantasyVORP.com (Beta)</title>
        <meta name="description" content="Fantasy VORP - Value Over Replacement Stats for Fantasy Sports" />
        <link rel="icon" href="/favicon-vorp.png" />
        <meta property="og:image" content={img_weblink} title="FantasyVORP.com"/>
    </Head>

    <Navbar />
    <Component {...pageProps} />
    <div className="buymeacoffee">
        <div className="img-container">
          <a className="btn" href="https://www.buymeacoffee.com/fantasyvorp" target="_blank" rel="noreferrer">
            <Image
            src={img_bmc}
            alt="Buy Dev a Coffee!"
            />
          </a>
        </div>
      </div>

    <Footer />

    </>
  )
}

export default MyApp
