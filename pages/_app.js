import '../styles/globals.scss'

// Components
import Head from 'next/head'
import Navbar from '../components/layout/navbar'
import Footer from '../components/layout/footer'
import Link from 'next/link'
import Image from 'next/image'
import img_bmc from '../public/bmc_icon_black.png'
import Script from 'next/script';


function MyApp({ Component, pageProps }) {
  return (
    <>
    <div className="mobileCover">
      <h1>Unfortunately this site is not formatted for mobile yet!</h1>
      <h2>Please view in a larger browser window</h2>
    </div>

    {/* Google Analytics Tag */}
    <Script async src="https://www.googletagmanager.com/gtag/js?id=G-BDV80K8G13"></Script>
    <Script>
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
