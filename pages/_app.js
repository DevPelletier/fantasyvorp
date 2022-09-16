import '../styles/globals.scss'

// Components
import Navbar from '../components/layout/navbar'
import Footer from '../components/layout/footer'
import Link from 'next/link'
import Image from 'next/image'
import img_bmc from '../public/bmc_icon_black.png'


function MyApp({ Component, pageProps }) {
  return (
    <>
    <div className="mobileCover">
      <h1>Unfortunately this site is not formatted for mobile yet!</h1>
      <h2>Please view in a larger browser window</h2>
    </div>

    <Navbar />
    <Component {...pageProps} />
    <div className="buymeacoffee">
        <div className="img-container">
          <a className="btn" href="https://www.buymeacoffee.com/fantasyvorp" target="_blank">
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
