import { Search, SentimentDissatisfied } from "@mui/icons-material";
import {
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import ProductCard from "./ProductCard";
import Cart from "./Cart";
import {generateCartItemsFrom} from "./Cart"; 
import "./Products.css";



const Products = () => {
   let {enqueueSnackbar}=useSnackbar();
    let token=localStorage.getItem("token");
    let username=localStorage.getItem("username");
    let balance=localStorage.getItem("balance");

    const [productDetails,setProductDetails]=useState([]);
    const [filteredProducts,setFilteredProducts]=useState([]);
    const [cartItems,setCartItems]=useState([]);
    const [cartLoad,setCartLoad]=useState(false);
    const [timeoutId,setTimeoutId]=useState(null);
    const [isLoading,setIsLoading]=useState(false);

    const performAPICall=async()=>{
      setIsLoading(true);
      try{
        let response=await axios.get(`${config.endpoint}/products`);
        setProductDetails(response.data);
        setFilteredProducts(response.data);
        setCartLoad(true); 
      }catch(error){
        if(error.response && error.response.status===400){
          enqueueSnackbar(error.response.data.message,{variant:"error"});
        }
      }
      setIsLoading(false);
    };
    useEffect(()=>{
      performAPICall();
    }, []);
    useEffect(()=>{
      fetchCart(token);
    }, [cartLoad]);

    const performSearch=async (text)=>{
      setIsLoading(true);
      try{
        let response=await axios.get(
          `${config.endpoint}/products/search?value=${text}`
        );
        setFilteredProducts(response.data);
      }catch(error){
        if(error.response){
          if(error.response.status===404){
            setFilteredProducts([]);
          }
          if(error.response.status===500){
            enqueueSnackbar(error.response.data.message,{variant:"error"});
            setFilteredProducts(productDetails);
          }
        }else{
          enqueueSnackbar(
            "Something went wrong.Check that the backed is running,reachhable and returns valid JSON.",{variant:"error"}
          );
        }
      }
      setIsLoading(false);
    };

    const debounceSearch=(event,debounceTimeout)=>{
      let text=event.target.value;
      if(debounceTimeout){
        clearTimeout(debounceTimeout);
      }
      let timeOut=setTimeout(()=>{
        performSearch(text);
      },500);
      setTimeoutId(timeOut);
    };

   const fetchCart=async (token)=>{
      if(!token) return;
      try{
        let response=await axios.get(`${config.endpoint}/cart`,{
          headers:{
            Authorization: `Bearer ${token}`,
          },
        });
        if(response.status===200){
          setCartItems(generateCartItemsFrom(response.data,productDetails));
        }
      }catch(e){
        if(e.response && e.response.status===400){
          enqueueSnackbar(e.response.data.message,{variant:"error"});
        }else{
          enqueueSnackbar(
            "Could not fetch cart details.Check that the backend is running,reachable and returns valid JSON.",
          {
            variant:"error",
          }
          );
        }
        return null;
      }
    };

    const isItemInCart=(items,productId)=>{
      let isIn=false;
      items.forEach((item)=>{
        if(item.productId===productId)isIn=true;
      });
      return isIn;
    };

    const addToCart=async(
      token,
      items,
      products,
      productId,
      qty,
      options={preventDuplicate:false}
    )=>{
      if(token){
        if(!isItemInCart(items,productId)){
          addInCart(productId,qty);
        }else{
          enqueueSnackbar(
            "Item already in cart.Use the cart sidebar to update quantity or remove item.",
          {
            variant:"warning",
          }
            );
        }
      }else{
        enqueueSnackbar("Login to add an item to the Cart",{
          variant:"warning",
        });
      }
    };
let handleCart=(productId)=>{
  addToCart(token,cartItems,productDetails,productId,1);
};
let handleQuantity=(productId,qty)=>{
  addInCart(productId,qty);
};
let addInCart=async(productId,qty)=>{
  try{
    let response=await axios.post(
      `${config.endpoint}/cart`,
      {
        productId:productId,
        qty:qty,
      },
      {
        headers:{
          Authorization:`Bearer ${token}`,
        },
      }
    );
    setCartItems(generateCartItemsFrom(response.data,productDetails));
  }catch(e){
    if(e.response && e.response.status===400){
      enqueueSnackbar(e.response.data.message,{variant:"error"});
    }else{
      enqueueSnackbar("Could not add to cart.Something went wrong.",{
        variant:"error",
      });
    }
  }
};
  return (
    <div>
      <Header>
        <TextField
        className="search-desktop"
        size="small"
        fullWidth
        InputProps={{
          endAdornment:(
            <InputAdornment position="end">
              <Search color="primary"/>
            </InputAdornment>
          ),
        }}
        placeholder="Search for items/categories"
        name="search"
        onChange={(e)=>debounceSearch(e,timeoutId)}
        />
      </Header>

      <TextField
      className="search-mobile"
      size="small"
      fullWidth
      InputProps={{
        endAdornment:(
          <InputAdornment position="end">
            <Search color="primary"/>
          </InputAdornment>
        ),
      }}
      placeholder="Search for items/categories"
      name="search"
      onChange={(e)=>debounceSearch(e,timeoutId)}
      />
      <Grid container>
        <Grid
        item
        container
        direction="row"
        justifyContent="center"
        alignItems="center"
        xs
        md
        >
         <Grid item className="product-grid">
           <Box className="hero">
             <p className="hero-heading">
               India’s <span className="hero-highlight">FASTEST DELIVERY</span>{" "}
               to your door step
             </p>
           </Box>
         </Grid>
         {isLoading?(
          <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          py={10}
          >
            <CircularProgress size={40}/>
            <h4>Loading products...</h4>
          </Box>
         ):(
            <Grid
            container
            item
            spacing={1}
            direction="row"
            justifyContent="center"
            alignItems="center"
            my={3}
            >
              {
                filteredProducts.length?(
                  filteredProducts.map((product)=>(
                    <Grid item key={product["_id"]} xs={6} md={3}>
                      <ProductCard
                      product={product}
                       handleAddToCart={(event)=>handleCart(product["_id"])} 
                      />
                      </Grid>
                  ))
                ):(
                  <Box
                  display="flex"
                  flexDirection="column"
                  justifyContent="center"
                  alignItems="center"
                  py={10}
                  >
                    <SentimentDissatisfied size={40}/>
                    <h4>No products found</h4>
                  </Box>
                )}
                </Grid>
         )}
       </Grid>
       {
        username && (
          <Grid
             container
             item
             xs={12}
             md={3}
             style={{backgroundColor:"#E9F5E1",height:"100vh"}}
             justifyContent="center"
             alignItems="stretch"
             >
              <Cart
              items={cartItems}
              products={productDetails}
              handleQuantity={handleQuantity}
              />
              </Grid>
        )}
       </Grid>
      <Footer />
    </div>
  );
};

export default Products;
