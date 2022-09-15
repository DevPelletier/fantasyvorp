import '../styles/globals.scss'

// Components
import Navbar from '../components/layout/navbar'
import Footer from '../components/layout/footer'


function MyApp({ Component, pageProps }) {
  return (
    <>

    <Navbar />
    <Component {...pageProps} />
    <Footer />
    </>
  )
}

export default MyApp
