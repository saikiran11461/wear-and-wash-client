import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { theme } from '../theme';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { postLogin } from '../Redux/Auth/action';
import { getUserBookingSlot } from '../Redux/App/action';

import { addData } from '../Storage/addData';
import { getData } from '../Storage/getData';

const validationSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(6, 'Password too short').required('Password is required'),
});

const Login = () => {
  const [errorMessage, setErrorMessage] = useState('');
  const [bookingCount, setBookingCount] = useState(0);
  const [userId, setUserId] = useState(null);

  const navigation = useNavigation();
  const dispatch = useDispatch();

  const handleSubmit = (values) => {
    console.log(values);
    dispatch(postLogin(values))
      .then(async (res) => {
        console.log('response', res);
        if (res?.payload?.response?.data?.message) {
          setErrorMessage(res?.payload?.response?.data?.message);
        }
        if (res?.payload?.message === 'login success') {
          try {
            await addData('userLocation', res?.payload?.location);
            await addData('userId', res?.payload?.id);
            await addData('email', res?.payload?.email);
            await addData('phone', res?.payload?.phone);
            await addData('name', res?.payload?.name);
            await addData('token', res?.payload?.token);

            dispatch(getUserBookingSlot())
              .then(async (res) => {
                const userIdFromStorage = await getData('userId');
                setUserId(JSON.parse(userIdFromStorage));

                // Assuming `res.data` contains the bookings array
                const bookingCount = res.data ? res.data.length : 0; // Get the count of bookings
                console.log(bookingCount);
                setBookingCount(bookingCount); // Update the booking count state

                // Navigate based on bookingCount
                if (bookingCount === 0) {
                  navigation.replace('Home'); // Navigate to Location page
                } else if (bookingCount === 1) {
                  navigation.replace('Home'); // Navigate to Home page
                }
              })
              .catch((err) => {
                console.log(err);
              });
          } catch (error) {
            console.log('error', error);
          }
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <Formik
      initialValues={{ email: '', password: '' }}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ values, handleChange, handleBlur, handleSubmit, errors, touched }) => (
        <View style={styles.container}>
          <Text style={styles.title}>Welcome Back!</Text>

          {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}

          <TextInput
            keyboardType='email-address'
            style={styles.input}
            value={values.email}
            onChangeText={handleChange('email')}
            onBlur={handleBlur('email')}
            placeholder='Email'
            placeholderTextColor='#aaa'
          />
          {touched.email && errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          <TextInput
            style={styles.input}
            value={values.password}
            onChangeText={handleChange('password')}
            onBlur={handleBlur('password')}
            placeholder='Password'
            placeholderTextColor='#aaa'
            secureTextEntry
          />
          {touched.password && errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

          <TouchableOpacity onPress={handleSubmit} style={styles.loginButton}>
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>

          {/* <TouchableOpacity onPress={handleSubmit} style={styles.loginButton}>
            <Text style={styles.loginButtonText}>Google</Text>
          </TouchableOpacity> */}

          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}>
              Don't have an account? <Text style={{ color: theme.color.primary }}>SignUp</Text>
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </Formik>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
    color: theme.color.primary,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#fff',
    fontSize: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginBottom: 10,
  },
  errorMessage: {
    textAlign: 'center',
    color: 'red',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: theme.color.secondary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  loginButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  registerLink: {
    textAlign: 'center',
    color: 'gray',
    marginTop: 20,
    fontSize: 16,
  },
});

export default Login;