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

  const storeCart = (modifiedCard: Product[]) => {
    localStorage.setItem('@RocketShoes:cart', JSON.stringify(modifiedCard.sort(sortFunction)))
  }

  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart')

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      // TODO
      const filteredProducts = cart.filter(product => product.id === productId)
      if (filteredProducts.length === 0) {
        const response = await api.get<Product>(`/products/${productId}`)
        response.data.amount = 1
        const sortedCart = [...cart, response.data].sort(sortFunction)
        setCart(sortedCart)
        storeCart(sortedCart)
      } else {
        // verificar estoque
        const filteredProduct = cart.filter(product => productId === product.id)[0]
        // verificar estoque
        const responseStock = await api.get<Stock>(`/stock/${productId}`)
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
        storeCart(tempCart)
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
      const verifyIfProductExists = cart.some(product => product.id === productId)
      if (!verifyIfProductExists) {
        throw new Error()
      }
      const tempCart = cart.filter(product => productId !== product.id)
      storeCart(tempCart)
      setCart(tempCart.sort(sortFunction))
    } catch {
      // TODO
      toast.error('Erro na remoção do produto')
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
      if (amount <= 0)
        return
      // verificar estoque
      const responseStock = await api.get<Stock>(`/stock/${productId}`)
      if(amount > responseStock.data.amount) {
        toast.error('Quantidade solicitada fora de estoque')
        return
      }
      const tempCart = cart.filter(product => productId !== product.id)
      const productModified = cart.filter(product => productId === product.id)[0]
      productModified.amount = amount
      const sortedCart = [...tempCart, productModified].sort(sortFunction)
      storeCart(sortedCart)
      setCart(sortedCart)
    } catch {
      // TODO
      toast.error('Erro na alteração de quantidade do produto')
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
