/* @flow */
import React, {Component, cloneElement} from 'react';
import ReactDOM from 'react-dom';
import uuid from 'uuid/v4';
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

    this.state = {
      arrowRef: null,
    };
  }

  componentDidMount() {
    // document.addEventListener('click', this._onDocumentClick);
    document.addEventListener('keydown', this._onDocumentKeydown);
    if (this._inputRef) {
      this._inputRef.focus();
    }
  }

  componentWillUnmount() {
    // document.removeEventListener('click', this._onDocumentClick);
    document.removeEventListener('keydown', this._onDocumentKeydown);
  }

  handleArrowRef = (node) => {
    this.setState({
      arrowRef: node,
    });
  };

  render() {
    const {props} = this;
    const className = cx(props.className, styles.root);

    const {
      onSubmit: formOnSubmit,
      onCancel: formOnCancel,
      filterAttributes,
      linkRefs,
    } = props.popoverForm.props;

    const {
      data: {
        url,
        target,
        'data-id': id,
      },
    } = props;

    const clonedForm = cloneElement(props.popoverForm, {
      initialValues: {
        url: url || '',
        target,
        id: id || uuid(),
        destinationType: 'URL',
        ...(id ? find(linkRefs, ({id: linkId}) => linkId === id) : null),
      },
      onSubmit: (data) => {
        const filteredAttributes = mapKeys(
          filterAttributes ? filterAttributes(data) : data,
          (_, key) => (['url', 'target'].includes(key) ? key : `data-${key}`),
        );

        formOnSubmit(data, () => this._onSubmit(filteredAttributes));
      },
      onCancel: () => {
        formOnCancel(props.onCancel());
      },
    });

    const openInNewTab = props.data && props.data.target === '_blank';
    return !props.popoverForm ? (
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
              onClick={props.onCancel}
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

  _onDocumentClick(event: Object) {
    let rootNode = ReactDOM.findDOMNode(this);
    if (!rootNode.contains(event.target)) {
      // Here we pass the event so the parent can manage focus.
      this.props.onCancel(event);
    }
  }

  _onDocumentKeydown(event: Object) {
    if (event.keyCode === 27) {
      this.props.onCancel();
    }
  }
}
