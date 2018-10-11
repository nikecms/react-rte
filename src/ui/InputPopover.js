/* @flow */
import React, {Component, cloneElement} from 'react';
import ReactDOM from 'react-dom';
import {find, mapKeys} from 'lodash';
import IconButton from './IconButton';
import ButtonGroup from './ButtonGroup';
import autobind from 'class-autobind';
import cx from 'classnames';

import styles from './InputPopover.css';

type Props = {
  className?: string;
  data?: Object;
  onCancel: () => any;
  onSubmit: (value: string, openInNewTab: boolean) => any;
  popoverForm: React.Node
};

export default class InputPopover extends Component {
  props: Props;
  _inputRef: ?Object;

  constructor() {
    super(...arguments);
    autobind(this);
    this.openInNewTab = false;
  }

  componentDidMount() {
    document.addEventListener('keydown', this._onDocumentKeydown);
    if (this._inputRef) {
      this._inputRef.focus();
    }
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this._onDocumentKeydown);
  }

  render() {
    const {
      className: classNameProp,
      popoverForm,
      onCancel,
      data,
    } = this.props;
    const className = cx(classNameProp, styles.root);

    const {
      url,
      target,
      'data-id': id,
    } = data;

    const {
      onSubmit: formOnSubmit,
      onCancel: formOnCancel,
      filterAttributes,
      getInitialValues,
    } = popoverForm.props;

    // The form passed in to the RTE has existing onSubmit and onCancel props,
    // which are replaced with ones which call the RTE's internal _onSubmit and onCancel prop
    // as callbacks
    const clonedForm = cloneElement(popoverForm, {
      initialValues: getInitialValues(url, target, id),
      onSubmit: (submitData) => {
        const filteredAttributes = mapKeys(
          filterAttributes ? filterAttributes(submitData) : submitData,
          (_, key) => (['url', 'target'].includes(key) ? key : `data-${key}`),
        );

        formOnSubmit(submitData, () => this._onSubmit(filteredAttributes));
      },
      onCancel: () => {
        formOnCancel(onCancel());
      },
    });

    const openInNewTab = target === '_blank';
    return !popoverForm ? (
      <div className={className}>
        <div className={styles.inner}>
          <input
            ref={this._setInputRef}
            type="text"
            placeholder="https://example.com/"
            defaultValue={url || ''}
            className={styles.input}
            onKeyPress={this._onInputKeyPress}
          />
          <ButtonGroup className={styles.buttonGroup}>
            <IconButton
              label="Cancel"
              iconName="cancel"
              onClick={onCancel}
            />
            <IconButton
              label="Submit"
              iconName="accept"
              onClick={this._onSubmit}
            />
          </ButtonGroup>
        </div>
        <div className={styles.inner}>
          <label className="radio-item">
            <input
              type="checkbox"
              ref={this._setNewTabRef}
              defaultChecked={openInNewTab}
            />
            <span> Open in New Tab </span>
          </label>
        </div>
      </div>
    ) : (<div className={styles.root}>
      {clonedForm}
      </div>

    );
  }

  _setInputRef(inputElement: Object) {
    this._inputRef = inputElement;
  }

  _setNewTabRef(inputElement: Object) {
    this._newTabRef = inputElement;
  }

  _onInputKeyPress(event: Object) {
    if (event.which === 13) {
      // Avoid submitting a <form> somewhere up the element tree.
      event.preventDefault();
      this._onSubmit();
    }
  }

  _onSubmit(data) {
    const value = this._inputRef ? this._inputRef.value : '';
    const openInNewTab = this._newTabRef ? this._newTabRef.checked : false;

    const linkData = data || {
      url: value, ...(
        openInNewTab
          ? {target: '_blank'}
          : null
        ),
    };

    this.props.onSubmit(linkData);
  }

  _onDocumentKeydown(event: Object) {
    if (event.keyCode === 27) {
      this.props.onCancel();
    }
  }
}
