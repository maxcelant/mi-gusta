import { useState, useEffect, Fragment } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getDoc, doc } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { db } from '../firebase.config'
import { MoonLoader } from 'react-spinners'
import {toast} from 'react-toastify'
import { AiFillClockCircle } from 'react-icons/ai'
import { GiCookingPot } from 'react-icons/gi'

import SwiperCore, { Navigation, Pagination, Scrollbar, A11y } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css';

SwiperCore.use([Navigation, Pagination, Scrollbar, A11y])

function Recipe() {

  const [ recipe, setRecipe ] = useState(null)
  const [ user, setUser ] = useState(null)
  const [ currentUser, setCurrentUser ] = useState(null)
  const [ loading, setLoading ] = useState(true)
  const [ numberOfTiles, setNumberOfTiles ] = useState(1)

  const [windowSize, setWindowSize] = useState(getWindowSize());

  const navigate = useNavigate()
  const params = useParams()
  const auth = getAuth()

  useEffect(() => {

    if(windowSize.innerWidth > 1024){
      setNumberOfTiles(3)
    } else {
      setNumberOfTiles(1)
    }

    const fetchRecipe = async () => {
      try {
        const docRef = doc(db, 'recipes', params.recipeId)
        const docSnap = await getDoc(docRef)
        if(docSnap.exists()){
          setRecipe(docSnap.data())
        }
      } catch (e) {
        toast.error('Could not fetch recipe')
      }
    }

    const fetchUser = async () => {
      try {
        const docRef = doc(db, 'users', params.userId)
        const docSnap = await getDoc(docRef)
        if(docSnap.exists()){
          setUser(docSnap.data())
          setLoading(false)
        }
      } catch (e) {
        toast.error('Could not fetch recipe')
      }
    }

    setCurrentUser(auth.currentUser) // so we can see if the current user is the author of this post

    fetchRecipe()
    fetchUser()

  }, [navigate, params.recipeId])

  useEffect(() => {

  }, [])

  useEffect(() => {
    function handleWindowResize() {
      setWindowSize(getWindowSize());
    }

    window.addEventListener('resize', handleWindowResize);

    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);

  function getWindowSize() {
    const {innerWidth, innerHeight} = window;
    return {innerWidth, innerHeight};
  }

  if(loading){
    return  <div class="flex justify-center items-center h-screen">
                <MoonLoader/>
            </div>
  }

  return (
    <div className='mb-16'>
      <div className='container mx-auto flex justify-start items-center mb-3'>
      {currentUser ?
        (<Link to={`/account/${params.userId}`}>
          <div class="avatar">
            <div  class="w-12 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
              <img src={user.avatar} alt={recipe.author}/>
            </div>
          </div>
        </Link>) :
        (<Link to={`/account/${params.userId}`}>
          <div class="avatar">
            <div  class="w-12 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
              <img src={user.avatar} alt={recipe.author}/>
            </div>
          </div>
        </Link>)
      }

      <div  className='flex justify-start font-bold text-md ml-3'>{recipe.author}</div>
      </div>
      <div className='text-2xl xl:text-3xl lg:text-3xl font-bold font-poppins'>{recipe.name}</div>
      <div className='text-md xl:text-lg lg:text-lg font-thin italic mb-3 text-brown-100'>{recipe.teaser}</div>
      <Swiper slidesPerView={numberOfTiles} pagination={{ clickable: true }}>
        {recipe.imageUrls.map((url, index) => (
          <SwiperSlide key={index}>
          <div
            style={{
              background: `url(${recipe.imageUrls[index]}) center no-repeat`,
              backgroundSize: "cover",
              minHeight: "20rem", // 👈 add this
            }}
            className="rounded-md"
        ></div>
          </SwiperSlide>
        ))}
      </Swiper>
      <div className='pt-4'>
        <div class="stats shadow-md bg-white w-full md:w-auto lg:w-auto xl:w-auto">
        <div class="stat place-items-center inline">
          <div className='inline'><AiFillClockCircle className='inline mr-2 text-2xl'/></div><div class="inline stat-title font-mukta">Prep Time</div>
          <div class="stat-value text-xl font-mukta">{recipe.prep_time}</div>
        </div>
        <div class="stat place-items-center inline">
        <div className='inline'><GiCookingPot className='inline mr-2 text-2xl font-mukta'/></div><div class="inline stat-title font-mukta">Cook Time</div>
          <div class="stat-value text-xl font-mukta">{recipe.cook_time}</div>
        </div>
      </div>
      </div>
      <div className='border-t border-gray-300 my-4'/>
      <div className='text-2xl font-semibold mt-4 font-mukta'>Description</div>
      <div className='container mx-auto bg-white p-4 rounded-md shadow-md'>
        <p className='mt-1 font-poppins'>{recipe.description}</p>
      </div>
      <div className='border-t border-gray-300 my-4'/>
      <div className='text-2xl font-semibold mt-4 font-mukta'>Ingredients</div>
      {recipe.ingredients.map((ingredient, index) => (
          <li key={index} className='text-sm md:text-md lg:text-lg xl:text-lg font-semibold m-2'>
            <span  className='bg-white p-0.5 px-2 rounded-lg font-poppins opacity-70 shadow-md'>{ingredient}</span>
          </li>
      ))}
      <div className='border-t border-gray-300 my-4'/>
      <div className='text-2xl font-semibold mt-4 font-mukta'>Directions</div>
      <div className='container mx-auto bg-white rounded-md p-4 shadow-md'>
        {recipe.directions.map((step, index) => (
          <Fragment>
          <div className='text-2xl font-semibold font-jost'>Step {index + 1}</div>
            <div className='font-poppins mb-3'>{step}</div>
            {index !== recipe.directions.length - 1 && <div className='border-t border-gray-300 my-4'/>}
          </Fragment>
        ))

        }
      </div>
      <hr/>
      
    </div>
  )

}

export default Recipe