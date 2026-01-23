// import React from 'react';
// import {View, Modal, Text, Alert, TouchableHighlight} from 'react-native';
// import PropTypes from 'prop-types';
// import Icon from 'react-native-vector-icons/FontAwesome';
// import {TextInput} from 'react-native-paper';
// import CheckBox from '@react-native-community/checkbox';
// import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

// import {CreditCard} from './common/CreditCard';
// import {CheckoutLogic, styles} from './CheckoutLogic';
// import PaymentReceiptWidget from './ReceiptPage';

// /* =======================
//    Types
// ======================= */

// interface Address {
//   _countryCode?: string;
//   _street?: string;
//   _city?: string;
//   _postCode?: string;
// }

// interface PaymentModalProps {
//   visible?: boolean;
//   amount?: number;
//   currency?: string;
//   description?: string;
//   transparent?: boolean;
//   lang?: 'English' | 'Arabic';
//   headerColor?: string;
//   hideLogo?: boolean;

//   showEmail?: boolean;
//   showPhone?: boolean;
//   showBilling?: boolean;
//   showReceipt?: boolean;

//   customerEmail?: string;
//   phoneNumber?: string;

//   billingAddress?: Address;
//   shippingAddress?: Address;
//   sameAddress?: boolean;

//   merchantReferenceID?: string;

//   onRequestClose?: () => void;
//   onPaymentSuccess?: (res: any) => void;
//   onPaymentFailure?: (res: any) => void;
// }

// interface PaymentModalState {
//   sameAddress: boolean;
//   showSuccessReceipt: boolean;
//   showFailureReceipt: boolean;
//   billingAddress?: Address;
//   shippingAddress?: Address;
// }

// /* =======================
//    Component
// ======================= */

// class PaymentModal extends CheckoutLogic<
//   PaymentModalProps,
//   PaymentModalState
// > {
//   orderId: string | null = null;
//   operation: string = '';
//   failureMesg: string = '';

//   constructor(props: PaymentModalProps) {
//     super(props);
//     this._handleCloseModal = this._handleCloseModal.bind(this);
//   }

//   renderTextInputRow(
//     label: string,
//     varName: string,
//     defaultValue?: string,
//     isBilling?: boolean,
//   ) {
//     const textColor = this.getTextColor();
//     const backgroundColor = '#FFFFFF';

//     return (
//       <TextInput
//         label={label}
//         theme={{
//           colors: {
//             primary: textColor,
//             text: textColor,
//             placeholder: textColor,
//             background: backgroundColor,
//           },
//         }}
//         style={{
//           textAlign: this.props.lang === 'Arabic' ? 'right' : 'left',
//         }}
//         mode="outlined"
//         dense
//         onChangeText={(value: string) =>
//           this.onAddressChange(varName, isBilling, value)
//         }
//         defaultValue={defaultValue}
//       />
//     );
//   }

//   validateInput(inputName: 'phoneNumber' | 'customerEmail') {
//     const input =
//       this.state?.[inputName] ?? this.props?.[inputName as keyof PaymentModalProps];

//     if (inputName === 'phoneNumber') {
//       const phoneRegex = /^\d{10}$/;
//       if (!phoneRegex.test(String(input))) {
//         Alert.alert(
//           'Invalid phone number',
//           'Please enter a valid 10-digit phone number.',
//         );
//       }
//     }

//     if (inputName === 'customerEmail') {
//       const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//       if (!emailRegex.test(String(input))) {
//         Alert.alert('Invalid email', 'Please enter a valid email address.');
//       }
//     }
//   }

//   renderEmail() {
//     const textColor = this.getTextColor();
//     const backgroundColor = '#FFFFFF';

//     return (
//       <View>
//         <Text style={this.TitleStyle()}>
//           {this.props.lang === 'English'
//             ? 'Customer Email'
//             : 'البريد الإلكتروني للعميل'}
//         </Text>

//         <TextInput
//           label={
//             this.props.lang === 'English'
//               ? 'Customer Email'
//               : 'البريد الإلكتروني للعميل'
//           }
//           theme={{
//             colors: {
//               primary: textColor,
//               text: textColor,
//               placeholder: textColor,
//               background: backgroundColor,
//             },
//           }}
//           mode="outlined"
//           dense
//           defaultValue={this.props.customerEmail}
//           onChangeText={(value: string) =>
//             this.handlePaymentDetails('customerEmail', value)
//           }
//           onBlur={() => this.validateInput('customerEmail')}
//         />
//       </View>
//     );
//   }

//   renderPhone() {
//     const textColor = this.getTextColor();
//     const backgroundColor = '#FFFFFF';

//     return (
//       <View>
//         <Text style={this.TitleStyle()}>
//           {this.props.lang === 'English' ? 'Phone Number' : 'رقم التليفون'}
//         </Text>

//         <TextInput
//           label={
//             this.props.lang === 'English' ? 'Phone Number' : 'رقم التليفون'
//           }
//           theme={{
//             colors: {
//               primary: textColor,
//               text: textColor,
//               placeholder: textColor,
//               background: backgroundColor,
//             },
//           }}
//           mode="outlined"
//           dense
//           defaultValue={this.props.phoneNumber}
//           onChangeText={(value: string) =>
//             this.handlePaymentDetails('phoneNumber', value)
//           }
//           onBlur={() => this.validateInput('phoneNumber')}
//         />
//       </View>
//     );
//   }

//   onPaymentSuccess(res: any) {
//     this.orderId = res?.order?.orderId;
//     this.operation = res?.order?.paymentOperation;

//     this.setState({showSuccessReceipt: true});
//     setTimeout(() => this.setState({showSuccessReceipt: false}), 500);

//     this._handleCloseModal();
//     this.props.onPaymentSuccess?.(res);
//   }

//   onPaymentFailure(res: any) {
//     this.failureMesg = res;

//     this.setState({showFailureReceipt: true});
//     setTimeout(() => this.setState({showFailureReceipt: false}), 1000);

//     this._handleCloseModal();
//     this.props.onPaymentFailure?.(res);
//   }

//   _handleCloseModal() {
//     this.setState({...this._calculateState()});
//     this.props.onRequestClose?.();
//   }

//   updateSameAddressOnOpen = () => {
//     this.setState({sameAddress: !!this.props.sameAddress});
//   };

//   render() {
//     const {visible, transparent, amount, currency} = this.props;

//     return (
//       <View>
//         <Modal
//           visible={
//             (this.state.showSuccessReceipt ||
//               this.state.showFailureReceipt) &&
//             !!this.props.showReceipt
//           }
//           transparent
//           animationType="slide">
//           <View style={styles.container}>
//             <PaymentReceiptWidget
//               lang={this.props.lang}
//               amount={amount}
//               currency={currency}
//               orderId={this.orderId}
//               merchantReferenceID={this.props.merchantReferenceID}
//               operation={this.operation}
//               showSuccessReceipt={this.state.showSuccessReceipt}
//               failureMesg={this.failureMesg}
//             />
//           </View>
//         </Modal>

//         <Modal
//           visible={visible}
//           transparent={transparent}
//           animationType="slide"
//           onShow={this.updateSameAddressOnOpen}
//           onRequestClose={this.props.onRequestClose}>
//           <View style={styles.container}>
//             <View style={styles.paymentContainer}>
//               <View style={{backgroundColor: this.props.headerColor}}>
//                 {this.renderCloseModalIcon()}
//                 {!this.props.hideLogo && this.renderPaymentInfo()}
//               </View>
//               {this.renderPaymentForm()}
//             </View>
//           </View>
//         </Modal>

//         {this._renderThreeDSecure()}
//       </View>
//     );
//   }
// }

// PaymentModal.defaultProps = {
//   transparent: true,
//   currency: '',
// };

// export default PaymentModal;
