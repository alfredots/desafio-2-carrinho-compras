import { AxiosResponse } from 'axios';
import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const sortFunction = (a: Product,b: Product) => {
    return a.id > b.id ? 1 : -1  
  }
  const [cart, setCart] = useState<Product[]>(() => {
    // const storagedCart = Buscar dados do localStorage

    // if (storagedCart) {
    //   return JSON.parse(storagedCart);
    // }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      // TODO
      const filteredProducts = cart.filter(product => product.id === productId)
      const response = await api.get<Product>(`/products/${productId}`)
      if (filteredProducts.length === 0) {
        
        response.data.amount = 1
        setCart([...cart, response.data].sort(sortFunction))
      } else {
        // verificar estoque
        const filteredProduct = cart.filter(product => productId === product.id)[0]
        // verificar estoque
        const responseStock = await api.get<Stock>(`/stock/${productId}`)
        console.log({ stock: responseStock.data.amount,  itemAmount: filteredProduct.amount})
        if(filteredProduct.amount === responseStock.data.amount) {
          toast.error('Quantidade solicitada fora de estoque')
          return
        }
        //
        const tempCart = cart.map((product) => {
          if (product.id === productId) {
            product.amount++
          }
          return product
        })
        setCart(tempCart.sort(sortFunction))
      }
      
    } catch {
      // TODO
      toast.error('Erro na adição do produto')
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
      const tempCart = cart.filter(product => productId !== product.id)
      setCart(tempCart)
    } catch {
      // TODO
      toast.error('Erro ao remover o produto')
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
      // verificar estoque
      const responseStock = await api.get<Stock>(`/stock/${productId}`)
      if(amount > responseStock.data.amount) {
        toast.error('Quantidade solicitada fora de estoque')
        return
      }
      //
      const response = await api.patch<Product>(`/products/${productId}`, {
        amount
      })
      const tempCart = cart.filter(product => productId !== product.id)
      const sortedCart = [...tempCart, response.data].sort(sortFunction)

      setCart(sortedCart)
    } catch {
      // TODO
      toast.error('Erro ao atualizar quantidade do produto')
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
