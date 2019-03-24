## React-combo-hook

This is a reusable hook for the easy creation of selects, comboboxes, autocompletes & dropdowns. It handles no rendering or JSX, that is left for you. It just provides the props and meta functions required to manage the internal state of a select box and you can do what ever you want with it. Please note, I'm a newbie but I'm keen to learn and build things. If there is anything I left out (I 99.9% certain there is), please feel free to PM me to request additions/extra functionality. I work a fulltime job so I will attempt to address requests as soon as I can. Also plan to chip away at some test coverage.

### TODO

- write better docs
- write tests
- setup CI
- verify what other aria attributes are needed

### Installation

```
npm install react-combo-box
yarn add react-combo-box
```

### Usage

```javascript
import useSelect from "react-combo-box";

const DefaultSelect = props => {
  //  props
  const { options, multi, isSearchable, name } = props;

  // hook
  const {
    selectInput,
    selectOption,
    selectLabel,
    selectMenu,
    selectSelectedOption,
    isOpen,
    selectedOptions,
    filteredOptions
  } = useSelect({ options, isSearchable, multi, name });

  return (
    <div {...styles("container")}>
      <label {...selectLabel().props}>
        {name}

        <div>
          {selectedOptions.map((selectedOption, index) => {
            if (multi) {
              return (
                <Value
                  key={selectedOption.label}
                  selectSelectedOption={selectSelectedOption({
                    selectedOption,
                    index
                  })}
                />
              );
            }
          })}

          <input {...selectInput().props} />
        </div>
      </label>

      {isOpen && (
        <div {...selectMenu().props}>
          {filteredOptions.map((option, index) => {
            return (
              <Option
                key={option.label}
                option={option}
                selectOption={selectOption({ option, index })}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
```

### Exposed api

```
  selectInput
    - arguments
      - customHandlers = () => ({}) (no extra args)
      - propOverrides = {}


    - props: {
        tabIndex: "0",
        autoComplete: "off",
        role: "combobox",
        type: "text",
        "aria-autocomplete": "list",
        "aria-expanded": { isOpen },
        "aria-haspopup": true,
        "aria-labelledby": name,
        "aria-controls": `${name}-options`,
        id: name,
        onChange: onInputChange,
        value: searchValue,
        ref: inputRef,
        onKeyDown,
        onFocus: onInputFocus,
        ...customHandlers({}),
        ...propOverrides
      }


  selectOption
    - arguments
      - index,
      - isSelected,
      - option,
      - key,
      - customHandlers = () => ({})
    - props: {
        key: option.value || key,
        onClick: e => onOptionClick(e, option, index),
        value: option.value,
        role: "option",
        "aria-selected": isSelected,
        type: "text",
        id: `${option}-${option.value}`,
        ...customHandlers({ index, option })
      },
    - meta: {
        isSelected: boolean,
        handleOptionClick,
        isActive: boolean,
        option
      }


  selectLabel
    - props: {
        htmlFor: name
      }


  selectMenu
    -  props: {
      "aria-expanded": isOpen,
      "aria-labelledby": name,
      role: "listbox",
      id: `${name}-options`,
      ref: optionMenuRef
    }


  selectSelectedOption
    - selectedOption,
      index,
      customHandlers = () => ({})
    -  props: {
      "aria-expanded": isOpen,
      id: `${name}-options`,
      onFocus: onSelectedOptionFocus,
      onBlur: onSelectedOptionBlur,
      ...customHandlers({ selectedOption, index })
    }
    - meta: {
      removeSelectedOption: () => removeSelectedOption(index),
      selectedOption,
      index
    }

  isOpen // boolean
  isFocused // boolean
  selectedOptions // array
  filteredOptions // array
```

### Arguments (with defaults)

```
  options = [],
  isSearchable = false,
  name = "my-select",
  multi = false,
  initialSelectedItem = multi ? [] : [options[0]],
  initialSearchValue = isSearchable || multi ? "" : options[0].label,
  initialHighlightedIndex = 0
```
