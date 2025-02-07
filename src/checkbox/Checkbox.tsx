import {
  watch,
  computed,
  ComputedRef,
  defineComponent,
  ExtractPropTypes,
  ComponentPublicInstance,
} from 'vue';

// Utils
import { createNamespace, extend, pick, truthProp } from '../utils';
import { CHECKBOX_GROUP_KEY } from '../checkbox-group/CheckboxGroup';

// Composables
import { useParent } from '@vant/use';
import { useExpose } from '../composables/use-expose';
import { useLinkField } from '../composables/use-link-field';

// Components
import Checker, { checkerProps } from './Checker';

const [name, bem] = createNamespace('checkbox');

const props = extend({}, checkerProps, {
  bindGroup: truthProp,
});

type CheckboxProps = ExtractPropTypes<typeof props>;

type CheckboxExpose = {
  toggle: (newValue?: boolean) => void;
  /**
   * @private
   */
  props: CheckboxProps;
  /**
   * @private
   */
  checked: ComputedRef<boolean>;
};

export type CheckboxInstance = ComponentPublicInstance<
  CheckboxProps,
  CheckboxExpose
>;

export default defineComponent({
  name,

  props,

  emits: ['change', 'update:modelValue'],

  setup(props, { emit, slots }) {
    const { parent } = useParent(CHECKBOX_GROUP_KEY);

    const setParentValue = (checked: boolean) => {
      const { name } = props;
      const { max, modelValue } = parent!.props;
      const value = modelValue.slice();

      if (checked) {
        const overlimit = max && value.length >= max;

        if (!overlimit && !value.includes(name)) {
          value.push(name);

          if (props.bindGroup) {
            parent!.updateValue(value);
          }
        }
      } else {
        const index = value.indexOf(name);

        if (index !== -1) {
          value.splice(index, 1);

          if (props.bindGroup) {
            parent!.updateValue(value);
          }
        }
      }
    };

    const checked = computed(() => {
      if (parent && props.bindGroup) {
        return parent.props.modelValue.indexOf(props.name) !== -1;
      }
      return !!props.modelValue;
    });

    const toggle = (newValue = !checked.value) => {
      if (parent && props.bindGroup) {
        setParentValue(newValue);
      } else {
        emit('update:modelValue', newValue);
      }
    };

    watch(
      () => props.modelValue,
      (value) => emit('change', value)
    );

    useExpose<CheckboxExpose>({ toggle, props, checked });
    useLinkField(() => props.modelValue);

    return () => (
      <Checker
        v-slots={pick(slots, ['default', 'icon'])}
        bem={bem}
        role="checkbox"
        parent={parent}
        checked={checked.value}
        onToggle={toggle}
        {...props}
      />
    );
  },
});
