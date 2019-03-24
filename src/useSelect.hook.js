const { useState, useRef, useEffect } = require("react");
const keyCodes = require("./key-codes");

const useSelect = config => {
  const {
    options = [],
    isSearchable = false,
    name = "my-select",
    multi = false,
    initialSelectedItem = multi ? [] : [options[0]],
    initialSearchValue = isSearchable || multi ? "" : options[0].label,
    initialHighlightedIndex = 0
  } = config;

  // state
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [searchValue, setSearchValue] = useState(initialSearchValue);
  const [highlightedIndex, setHighlightedIndex] = useState(
    initialHighlightedIndex
  );
  const [selectedOptions, setSelectedOptions] = useState(initialSelectedItem);

  // refs
  const inputRef = useRef(null);
  const optionMenuRef = useRef(null);

  // handlers
  const closeSelectOptions = () => {
    setIsFocused(false);
    setIsOpen(false);
  };

  const openSelectOptions = () => {
    setIsFocused(true);
    setIsOpen(true);
  };

  const filterOptions = value => {
    if (!isSearchable) return options;
    return options.filter(option =>
      option.label.toLowerCase().includes(value.toLowerCase())
    );
  };

  const addSelectedOption = option => {
    let newValue;

    if (multi) newValue = [...selectedOptions, option];
    if (!multi) newValue = [option];

    setSelectedOptions(newValue);

    setSearchValue("");

    if (multi) inputRef.current.focus();
  };

  const removeSelectedOption = index => {
    if (!multi) setSearchValue("");
    if (!multi) inputRef.current.focus();

    const newArray = [
      ...selectedOptions.slice(0, index),
      ...selectedOptions.slice(index + 1)
    ];

    inputRef.current.focus();
    setSelectedOptions(newArray);
  };

  const handleOptionClick = (e, option) => {
    const index = selectedOptions.findIndex(
      selectedOption => selectedOption.value === option.value
    );

    if (index >= 0 && multi) {
      removeSelectedOption(index);
    } else {
      addSelectedOption(option);
    }
  };

  // handle document mousedown
  const handleMouseDown = e => {
    if (inputRef.current && optionMenuRef.current) {
      const clickHasInput = inputRef.current.contains(e.target);
      const clickHasMenu = optionMenuRef.current.contains(e.target);

      if (!clickHasInput && !clickHasMenu) closeSelectOptions();
    }
  };

  // keyDown handlers
  const onKeyDown = e => {
    const upArrow = keyCodes[e.which] === "upArrow";
    const downArrow = keyCodes[e.which] === "downArrow";
    const enterKey = keyCodes[e.which] === "enter";
    const backspaceDelete = keyCodes[e.which] === "backspace/delete";
    const tabKey = keyCodes[e.which] === "tab";

    const lastIndex = options.length - 1;
    const firstIndex = 0;
    const lastSelectedIndex = selectedOptions.length - 1;
    const lastOption = highlightedIndex === options.length - 1;
    const firstOption = highlightedIndex === 0;

    if (upArrow || downArrow) e.preventDefault();

    if (upArrow) {
      if (!isOpen) openSelectOptions();
      if (firstOption) setHighlightedIndex(lastIndex);
      if (!firstOption) setHighlightedIndex(highlightedIndex - 1);
    }

    if (downArrow) {
      if (!isOpen) openSelectOptions();
      if (lastOption) setHighlightedIndex(firstIndex);
      if (!lastOption) setHighlightedIndex(highlightedIndex + 1);
    }

    if (enterKey && isOpen) {
      e.preventDefault();
      handleOptionClick(e, options[highlightedIndex]);
      if (!multi) closeSelectOptions();
    }

    if (tabKey) {
      closeSelectOptions();
    }

    if (backspaceDelete && multi && !searchValue) {
      removeSelectedOption(lastSelectedIndex);
    }
  };

  // onClick handlers
  const onOptionClick = (e, option, index) => {
    handleOptionClick(e, option);
    setHighlightedIndex(index);

    if (!multi) closeSelectOptions();
  };

  // onChange handlers
  const onInputChange = e => {
    if (isSearchable) setSearchValue(e.target.value);
  };

  const onSelectedOptionBlur = () => {
    closeSelectOptions();
  };

  // focus handlers
  const onInputFocus = () => {
    openSelectOptions();
  };

  const onSelectedOptionFocus = () => {
    openSelectOptions();
  };

  // lifecycles
  useEffect(() => {
    if (!isOpen && !multi) setSearchValue(selectedOptions[0].label);
    if (!isOpen && multi) setSearchValue("");
    if (isOpen && !multi)
      setSearchValue(selectedOptions[0].label || initialSearchValue);
    if (isOpen && multi) setSearchValue(initialSearchValue);
  }, [isOpen]);

  useEffect(() => {
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  });

  const selectInput = (inputConfig = {}) => {
    const { customHandlers = () => ({}), propOverrides = {} } = inputConfig;

    // aria-autocomplete="list"
    // aria-labelledby="downshift-6-label"

    return {
      props: {
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
    };
  };

  const selectOption = (optionConfig = {}) => {
    const {
      index,
      isSelected,
      option,
      key,
      customHandlers = () => ({})
    } = optionConfig;

    return {
      props: {
        key: option.value || key,
        onClick: e => onOptionClick(e, option, index),
        value: option.value,
        role: "option",
        "aria-selected": isSelected,
        type: "text",
        id: `${option}-${option.value}`,
        ...customHandlers({ index, option })
      },
      meta: {
        isSelected: selectedOptions.filter(
          selectedOption => selectedOption.value === option.value
        ).length,
        handleOptionClick,
        isActive: index === highlightedIndex,
        option
      }
    };
  };

  const selectLabel = () => {
    return {
      props: {
        htmlFor: name
      }
    };
  };

  const selectMenu = () => {
    return {
      props: {
        "aria-expanded": isOpen,
        "aria-labelledby": name,
        role: "listbox",
        id: `${name}-options`,
        ref: optionMenuRef
      },
      meta: {}
    };
  };

  const selectSelectedOption = (selectedOptionConfig = {}) => {
    const {
      selectedOption,
      index,
      customHandlers = () => ({})
    } = selectedOptionConfig;

    return {
      props: {
        "aria-expanded": isOpen,
        id: `${name}-options`,
        onFocus: onSelectedOptionFocus,
        onBlur: onSelectedOptionBlur,
        ...customHandlers({ selectedOption, index })
      },
      meta: {
        removeSelectedOption: () => removeSelectedOption(index),
        selectedOption,
        index
      }
    };
  };

  return {
    selectInput,
    selectOption,
    selectLabel,
    selectMenu,
    selectSelectedOption,
    isOpen,
    isFocused,
    selectedOptions,
    filteredOptions: filterOptions(searchValue)
  };
};

module.exports = useSelect;
