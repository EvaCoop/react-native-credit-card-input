import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  View,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ViewPropTypes,
  Animated,
  Animation
} from "react-native";

import Icons from "./Icons";
import {Input} from 'react-native-elements'
const s = StyleSheet.create({
  baseInputStyle: {
    color: "black",
  },
});

export default class CCInput extends Component {
  constructor(props){
    super(props);
    this.animatedValue = new Animated.Value(0);
  }

  static propTypes = {
    field: PropTypes.string.isRequired,
    label: PropTypes.string,
    value: PropTypes.string,
    placeholder: PropTypes.string,
    keyboardType: PropTypes.string,

    status: PropTypes.oneOf(["valid", "invalid", "incomplete"]),

    containerStyle: ViewPropTypes.style,
    inputStyle: Text.propTypes.style,
    labelStyle: Text.propTypes.style,
    validColor: PropTypes.string,
    invalidColor: PropTypes.string,
    placeholderColor: PropTypes.string,

    onFocus: PropTypes.func,
    onChange: PropTypes.func,
    onBecomeEmpty: PropTypes.func,
    onBecomeValid: PropTypes.func,
    additionalInputProps: PropTypes.shape(TextInput.propTypes),
  };

  static defaultProps = {
    label: "",
    value: "",
    status: "incomplete",
    containerStyle: {},
    inputStyle: {},
    labelStyle: {},
    onFocus: () => {},
    onChange: () => {},
    onBecomeEmpty: () => {},
    onBecomeValid: () => {},
    additionalInputProps: {},
  };

  onBecomeInvalid = () => {if(this.refs.input && this.refs.input.shake) this.refs.input.shake()}
  onBecomeFocused = (focus) => {
    Animated.timing(this.animatedValue, {
      toValue: (focus ? 1 : 0),
      duration: 200,
      useNativeDrivers: true,
    }).start();
  }
  componentWillReceiveProps = newProps => {
    const { status, value, onBecomeEmpty, onBecomeValid, field, focused } = this.props;
    const { status: newStatus, value: newValue, focused: newFocused } = newProps;

    if (value !== "" && newValue === "") onBecomeEmpty(field);
    if (status !== "valid" && newStatus === "valid") onBecomeValid(field);
    if (status !== "invalid" && newStatus === "invalid") this.onBecomeInvalid(field);
    if ((focused !== field && newFocused === field) || value){
      this.onBecomeFocused(true);
    } else if(focused === field && newFocused !== field){
      this.onBecomeFocused(false);
    }
  };

  focus = () => this.refs.input.focus();

  _onFocus = () => this.props.onFocus(this.props.field);
  _onChange = value => this.props.onChange(this.props.field, value);

  render() {
    const { label, value, placeholder, status, keyboardType,
            containerStyle, inputStyle, labelStyle,
            validColor, invalidColor, placeholderColor,
            additionalInputProps, brand, focused, field} = this.props;
    let brandName = brand || 'placeholder';
    return (
      <TouchableOpacity onPress={this.focus}
        activeOpacity={0.99}>
          <Input ref="input"
            containerStyle={containerStyle}
            // label= { ((label && focused === field) || !value ? label : " ")}
            {...additionalInputProps}
            keyboardType={keyboardType}
            autoCapitalise="words"
            rightIcon={(this.props.field == 'number' ? Icons[brandName] : null)}
            autoCorrect={false}
            label={<Animated.Text
              style={[
                labelStyle,
                {
                position: 'absolute',
                left: 0,
                fontSize: this.animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 15],
                }),
                top: this.animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [10, -15],
                }),
                color: this.animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [placeholderColor, 'black'],
                }),
                fontWeight: (focused === field ? 'bold': 'normal')
              }]}
            >
              {((label ) || value ? label : " ")}
            </Animated.Text>}
            inputStyle={[
              s.baseInputStyle,
              {margin: 0, padding: 0},
              inputStyle,
              ((validColor && status === "valid") ? { color: validColor } :
              (invalidColor && status === "invalid") ? { color: invalidColor } :
              {}),
            ]}            
            underlineColorAndroid={"transparent"}
            placeholderTextColor={placeholderColor}
            // placeholder={(label && focused === field ? " " : label)}
            value={value}
            onFocus={this._onFocus}
            onChangeText={this._onChange} />
      </TouchableOpacity>
    );
  }
}
